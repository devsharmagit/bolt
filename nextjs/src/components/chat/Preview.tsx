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
        console.log('📦 Installing dependencies...');

        const installProcess = await webContainer.spawn('npm', ['install']);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data);
            },
          })
        );

        await installProcess.exit;
        console.log('✅ Dependencies installed');

        console.log('🚀 Starting dev server...');
        await webContainer.spawn('npm', ['run', 'dev']);

        // Listen ONCE for server-ready
        webContainer.on('server-ready', (port, url) => {
          console.log('🌍 Server ready at:', url);
          setUrl(url);
        });
      } catch (err) {
        console.error('❌ Preview failed:', err);
      }
    };

    startPreview();
  }, [webContainer, files]);

  return (
    <div className="h-full w-full">
      {!url && (
        <div className="h-full flex items-center justify-center text-gray-400">
          <p>Starting preview…</p>
        </div>
      )}

      {url && (
        <iframe
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      )}
    </div>
  );
}
