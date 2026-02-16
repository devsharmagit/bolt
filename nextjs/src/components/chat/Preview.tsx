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
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Starting...');
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        setStatusMessage('Installing dependencies...');
        setProgress(10);
        setLogs((prev) => [...prev, '📦 Installing dependencies...']);

        // Simulate gradual progress during install
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev < 50) {
              return Math.min(prev + 1, 50);
            }
            return prev;
          });
        }, 200);

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
        
        // Clear interval and set to 60%
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setProgress(60);
        setLogs((prev) => [...prev, '✅ Dependencies installed']);

        setStatusMessage('Starting dev server...');
        setProgress(70);
        setLogs((prev) => [...prev, '🚀 Starting dev server...']);
        
        // Gradual progress for server start
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev < 85) {
              return Math.min(prev + 1, 85);
            }
            return prev;
          });
        }, 300);
        
        await webContainer.spawn('npm', ['run', 'dev']);

        // Listen ONCE for server-ready
        webContainer.on('server-ready', (port, url) => {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setProgress(100);
          setStatusMessage('Server ready!');
          setLogs((prev) => [...prev, `🌍 Server ready at: ${url}`]);
          setUrl(url);
        });
      } catch (err) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setStatusMessage('Preview failed');
        setLogs((prev) => [...prev, `❌ Preview failed: ${err}`]);
        setRuntimeErrors((prev) => [...prev, `Setup Error: ${err}`]);
      }
    };

    startPreview();
    
    // Cleanup interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [webContainer, files]);

  // Listen for iframe errors and console messages
  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return;

    const iframe = iframeRef.current;
    
    const handleIframeError = (event: MessageEvent) => {
      // Listen for console errors from the iframe
      if (event.data && event.data.type === 'error') {
        const errorMsg = event.data.message || 'Unknown error';
        setRuntimeErrors((prev) => {
          // Avoid duplicate errors
          if (prev.includes(errorMsg)) return prev;
          return [...prev, errorMsg];
        });
      }
    };

    // Listen for unhandled errors in the iframe
    window.addEventListener('message', handleIframeError);

    // Inject error listener script into iframe
    try {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        // Capture console.error
        const script = iframe.contentDocument?.createElement('script');
        if (script) {
          script.textContent = `
            (function() {
              const originalError = console.error;
              console.error = function(...args) {
                window.parent.postMessage({
                  type: 'error',
                  message: args.join(' ')
                }, '*');
                originalError.apply(console, args);
              };
              
              window.addEventListener('error', function(event) {
                window.parent.postMessage({
                  type: 'error',
                  message: event.message || event.error?.toString() || 'Runtime error'
                }, '*');
              });
              
              window.addEventListener('unhandledrejection', function(event) {
                window.parent.postMessage({
                  type: 'error',
                  message: 'Unhandled Promise Rejection: ' + (event.reason?.toString() || 'Unknown')
                }, '*');
              });
            })();
          `;
          iframe.contentDocument?.head?.appendChild(script);
        }
      }
    } catch (err) {
      console.warn('Could not inject error listener into iframe:', err);
    }

    return () => {
      window.removeEventListener('message', handleIframeError);
    };
  }, [iframeReady]);

  // Once iframe is ready, always show it (even if url changes)
  return (
    <div className="h-full w-full flex flex-col">
      {/* Runtime Error Banner */}
      {runtimeErrors.length > 0 && (
        <div className="bg-rose-900/90 border-b border-rose-600 px-4 py-2 max-h-32 overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-rose-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-rose-200">Runtime Error{runtimeErrors.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {runtimeErrors.map((error, idx) => (
                  <div key={idx} className="text-xs text-rose-100 font-mono">
                    {error}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setRuntimeErrors([])}
              className="text-rose-200 hover:text-white transition-colors p-1"
              title="Clear errors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {(!url || !iframeReady) ? (
        !url ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4 py-2">
            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{statusMessage}</span>
                <span className="text-sm text-gray-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {/* Logs */}
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-y-auto h-80 text-xs font-mono whitespace-pre-wrap">
              {logs.length === 0 ? <p>Starting preview…</p> : logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-0 flex-1"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            onLoad={() => setIframeReady(true)}
          />
        )
      ) : (
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 flex-1"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      )}
    </div>
  );
}