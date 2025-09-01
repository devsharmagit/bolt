import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './chat/Sidebar';
import FileExplorer from './chat/FileExplorer';
import CodeEditor from './chat/CodeEditor';
import {Preview} from './chat/Preview';
import { FileItem, Step, StepType,  } from '../types';
import axios from "axios";
import { BACKEND_URL } from '../config';
import { parseXml } from '../step';
import { useWebContainer } from '../hooks/useWebcontainer';

interface LlmMessage {role: "user" | "assistant", content: string;};

const ChatPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || '';

  const [laoding, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  

  const [llmMessages, setLlmMessages] = useState<LlmMessage[]>([]);
  
const webcontainer = useWebContainer();

  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  const [files, setFiles] = useState<FileItem[]>([]);

  type TemplateResponse = {
    prompts?: string[];
    uiPrompts?: string[];
  };
  type ChatResponse = {
    response: string
  }

  

  useEffect(() => {
    const init = async (initialPrompt: string) => {
    const response = await axios.post<TemplateResponse>(`${BACKEND_URL}/template`, {
      prompt: initialPrompt
    });
    setTemplateSet(true);
    if (response.data?.prompts && response.data.uiPrompts) {
      const firstSteps = parseXml(response.data.uiPrompts[0])
      setSteps((prev)=>([...prev, ...firstSteps]));
      const userarr :LlmMessage[] = response.data.prompts.map((p: string) => ({
          role: "user",
          content : p
        }))
        setLoading(true);
      const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
        messages: [...userarr, {role: "user", content: initialPrompt}]
      });
      setLoading(false);
      if(stepsResponse.data?.response){
        const parsedSteps = parseXml(stepsResponse.data.response)
        setSteps((prev)=>([...prev, ...parsedSteps]))

    setLlmMessages([
      ...userarr,
      { role: "user", content: initialPrompt }
    ]);

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
      }
    }
    
  }
    if (initialPrompt) {
    init(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        const finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
        
      }))
    }
    console.log(files);
  }, [steps, files]);


  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);


  const getFileContent = (path: string): string => {
    const findFile = (nodes: FileItem[], targetPath: string): string => {
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

  const handleSend = async(prompt : string)=>{

                    setLoading(true);
                    const stepsResponse = await axios.post<ChatResponse>(`${BACKEND_URL}/chat`, {
                      messages: [...llmMessages, {role: "user", content: prompt}]
                    });
                    setLoading(false);

                    setLlmMessages(x => [...x, {role: "user", content: prompt}]);
                    setLlmMessages(x => [...x, {
                      role: "assistant",
                      content: stepsResponse.data.response
                    }]);
                    
                    setSteps(s => [
                      ...s,
                      ...parseXml(stepsResponse.data.response).map(x => ({
                        ...x,
                        status: "pending" as const
                      }))
                    ]);
  }

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      {/* Chat/Steps Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-800">
        <Sidebar loading={loading} messages={llmMessages} steps={steps} handleSend={handleSend} />
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
        <div className="flex-1 ">
          {activeTab === 'code' ? (
            <CodeEditor 
              selectedFile={selectedFile}
              content={getFileContent(selectedFile)}
            />
          ) : (
            <Preview files={files} webContainer={webcontainer} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;