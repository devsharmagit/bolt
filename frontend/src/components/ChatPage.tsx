import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './chat/Sidebar';
import FileExplorer from './chat/FileExplorer';
import CodeEditor from './chat/CodeEditor';
import Preview from './chat/Preview';
import { FileNode, Message, Step,  } from '../types';
import axios from "axios";
import { BACKEND_URL } from '../config';
import { parseXml } from '../step';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  const [files] = useState<FileNode[]>([
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.tsx', type: 'file', content: 'import React from \'react\';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-gray-900 text-white">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;' },
        { name: 'index.css', type: 'file', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' },
        { name: 'main.tsx', type: 'file', content: 'import React from \'react\';\nimport ReactDOM from \'react-dom/client\';\nimport App from \'./App\';\nimport \'./index.css\';\n\nReactDOM.createRoot(document.getElementById(\'root\')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);' }
      ]
    },
    { name: 'package.json', type: 'file', content: '{\n  "name": "bolt-app",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}' },
    { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Bolt App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>' }
  ]);

  type TemplateResponse = {
    prompts?: string[];
  };
  type ChatResponse = {
    response: string
  }

  const init = async (initialPrompt: string) => {
    const response = await axios.post<TemplateResponse>(`${BACKEND_URL}/template`, {
      prompt: initialPrompt
    });

    if (response.data?.prompts) {
      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
        messages: response.data.prompts.map((p: string) => ({
          role: "user",
          content : p
        }))
      });
      if(stepsResponse.data?.response){
        const parsedSteps = parseXml(stepsResponse.data.response)
        setSteps((prev)=>([...prev, ...parsedSteps]))
      }
    }
  }

  useEffect(() => {
    if (initialPrompt) {
    init(initialPrompt);
    }
  }, [initialPrompt]);

  const getFileContent = (path: string): string => {
    const findFile = (nodes: FileNode[], targetPath: string): string => {
      for (const node of nodes) {
        if (node.type === 'file' && (node.name === targetPath || targetPath.endsWith(node.name))) {
          return node.content || '';
        }
        if (node.type === 'folder' && node.children) {
          const result = findFile(node.children, targetPath);
          if (result) return result;
        }
      }
      return '';
    };
    
    return findFile(files, path);
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Chat/Steps Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-800">
        <Sidebar messages={messages} steps={steps} />
      </div>

      {/* File Explorer */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800">
        <FileExplorer 
          files={files} 
          selectedFile={selectedFile} 
          onFileSelect={setSelectedFile} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Header */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'code'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'code' ? (
            <CodeEditor 
              selectedFile={selectedFile}
              content={getFileContent(selectedFile)}
            />
          ) : (
            <Preview />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;