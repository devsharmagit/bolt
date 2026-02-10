'use client';

import { WebContainer } from '@webcontainer/api';
import { useEffect, useRef, useState } from 'react';
import { FileItem } from '@/types/file.type';

interface PreviewProps {
  files: FileItem[];
  webContainer: WebContainer;
}

export function Preview({ files, webContainer }: PreviewProps) {
  const [url, setUrl] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [iframeReady, setIframeReady] = useState(false);

  // 🔒 This ref ensures npm install + dev runs ONLY ONCE
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // 🚫 If already started, do nothing
    if (hasStartedRef.current) return;

    // 🚫 If no files yet, do nothing
    if (!webContainer || files.length === 0) return;

    hasStartedRef.current = true;

    const startPreview = async () => {
      try {
        setLogs((prev) => [...prev, '📦 Installing dependencies...']);

        const installProcess = await webContainer.spawn('npm', ['install']);

        await installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              // Remove ANSI escape codes (like \x1b[1G, \x1b[0K, etc.)
              const str = String(data).replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r?\n$/, '');
              // If it's a spinner character, update the last log line in place
              if (/^\s*[-/\\|]\s*$/.test(str)) {
                setLogs((prev) => {
                  if (prev.length === 0) return [str];
                  // If the last log is also a spinner, replace it, else append
                  if (/^\s*[-/\\|]\s*$/.test(prev[prev.length - 1])) {
                    return [...prev.slice(0, -1), str];
                  } else {
                    return [...prev, str];
                  }
                });
                return;
              }
              if (str.trim() === '') return;
              setLogs((prev) => [...prev, str]);
            },
          })
        );

        await installProcess.exit;
        setLogs((prev) => [...prev, '✅ Dependencies installed']);

        setLogs((prev) => [...prev, '🚀 Starting dev server...']);
        await webContainer.spawn('npm', ['run', 'dev']);

        // Listen ONCE for server-ready
        webContainer.on('server-ready', (port, url) => {
          setLogs((prev) => [...prev, `🌍 Server ready at: ${url}`]);
          setUrl(url);
        });
      } catch (err) {
        setLogs((prev) => [...prev, `❌ Preview failed: ${err}`]);
      }
    };

    startPreview();
  }, [webContainer, files]);

  // Once iframe is ready, always show it (even if url changes)
  return (
    <div className="h-full w-full flex flex-col">
      {(!url || !iframeReady) ? (
        !url ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4 py-2">
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-y-auto h-80 text-xs font-mono whitespace-pre-wrap">
              {logs.length === 0 ? <p>Starting preview…</p> : logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-0 flex-1"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            onLoad={() => setIframeReady(true)}
          />
        )
      ) : (
        <iframe
          src={url}
          className="w-full h-full border-0 flex-1"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      )}
    </div>
  );
}
