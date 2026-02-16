'use client';
import dynamic from 'next/dynamic';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  selectedFile: string;
  content: string;
}

export default function CodeEditor({ selectedFile, content }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  const getLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'typescript';
      case 'ts':
        return 'typescript';
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="h-full bg-gray-950">
      {/* Header */}
      <div className="h-12 bg-gray-900 border-b border-yellow-300/20 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-300">{selectedFile}</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="h-[calc(100%-3rem)]">
        <Editor
          height="100%"
          language={getLanguage(selectedFile)}
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
