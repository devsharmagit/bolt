import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  selectedFile: string;
  content: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedFile, content }) => {
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
    <div className="h-full bg-gray-900">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-300">{selectedFile}</span>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[calc(100%-3rem)]">
        <Editor
          height="100%"
          language={getLanguage(selectedFile)}
          value={content}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            selectOnLineNumbers: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;