'use client';
import { useWebContainer } from '@/hooks/useWebcontainer';
import { LlmMessage } from '@/types/chat.type';
import { useEffect, useState } from 'react';
import { Step, FileItem, StepType } from '@/types/file.type';
import { parseXml } from '@/utils/step';
import { chatAction } from '@/app/actions/chat';
import { templateAction } from '@/app/actions/template';
import Sidebar from '@/components/chat/Sidebar';
import FileExplorer from '@/components/chat/FileExplorer';
import CodeEditor from '@/components/chat/CodeEditor';
import { Preview } from '@/components/chat/Preview';
import { sortFileStructure } from '@/lib/file';
import Navbar from '@/components/chat/Navbar';


export default function ChatPage() {
  const [initialPrompt, setInitialPrompt] = useState('');

  const [laoding, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);

  const [llmMessages, setLlmMessages] = useState<LlmMessage[]>([]);

  const webcontainer = useWebContainer();
  console.log("webcontainer is called");
  console.log(webcontainer);

  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const prompt = sessionStorage.getItem('initialPrompt');
    if (prompt) {
      setInitialPrompt(prompt);
      sessionStorage.removeItem('initialPrompt'); // Clean up
    }
  }, []);

  useEffect(() => {
    const init = async (initialPrompt: string) => {
      const response = await templateAction(initialPrompt);
      setTemplateSet(true);
      if (response?.prompts && response.uiPrompts) {
        // Start with ID 1 for the first call
        const firstSteps = parseXml(response.uiPrompts[0], 1);
        setSteps((prev) => {
          const updated = [...prev, ...firstSteps];
          return updated;
        });
        
        const injectedPrompts: LlmMessage[] = response.prompts.map((p: string) => ({
          role: "user",
          content: p,
          displayInChat: false
        }));

        setLoading(true);
        const stepsResponse = await chatAction([...injectedPrompts, { role: "user", content: initialPrompt, displayInChat: true }]);
        setLoading(false);
        
        if (stepsResponse?.response) {
          const responseText = stepsResponse.response;
          
          // Calculate next available ID from current steps
          setSteps((prevSteps) => {
            const maxId = prevSteps.length > 0 ? Math.max(...prevSteps.map(s => s.id)) : 0;
            const parsedSteps = parseXml(responseText, maxId + 1);
            return [...prevSteps, ...parsedSteps];
          });

          setLlmMessages([
            ...injectedPrompts,
            { role: "user", content: initialPrompt, displayInChat: true }
          ]);

          setLlmMessages(x => [...x, { role: "assistant", content: responseText }]);
        }
      }
    };
    if (initialPrompt) {
      init(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    const pendingSteps = steps.filter(({ status }) => status === "pending");
    if (pendingSteps.length === 0) {
      return;
    }

    let originalFiles = [...files];
    let updateHappened = false;
    pendingSteps.forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = originalFiles;

        let currentFolder = "";
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder);
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              });
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder);
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              });
            }

            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
      }
    });

    if (updateHappened) {
      // Sort the file structure after all modifications are complete
      originalFiles = sortFileStructure(originalFiles);
      setFiles(originalFiles);
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        };
      }));
    }
  }, [steps, files]);

  useEffect(() => {
    type MountEntry = {
      directory?: Record<string, MountEntry>;
      file?: { contents: string };
    };

    const createMountStructure = (files: FileItem[]): Record<string, MountEntry> => {
      const mountStructure: Record<string, MountEntry> = {};

      const processFile = (file: FileItem, isRootFolder: boolean): MountEntry => {
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
    // Type assertion: our structure matches FileSystemTree from @webcontainer/api
    webcontainer?.mount(mountStructure as unknown as Parameters<NonNullable<typeof webcontainer>['mount']>[0]);
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

  const handleSend = async (prompt: string) => {
    setLoading(true);
    const stepsResponse = await chatAction([...llmMessages, { role: "user", content: prompt, displayInChat: true }]);
    setLoading(false);

    if (!stepsResponse?.response) {
      console.error('No response from chat action');
      return;
    }

    const responseText = stepsResponse.response;

    setLlmMessages(x => [...x, { role: "user", content: prompt, displayInChat: true }]);
    setLlmMessages(x => [...x, {
      role: "assistant",
      content: responseText
    }]);

    setSteps(s => {
      // Calculate the next available ID
      const maxId = s.length > 0 ? Math.max(...s.map(step => step.id)) : 0;
      const parsedSteps = parseXml(responseText, maxId + 1);
      return [
        ...s,
        ...parsedSteps.map(x => ({
          ...x,
          status: "pending" as const
        }))
      ];
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Navbar */}
      <Navbar files={files} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat/Steps Sidebar */}
        {isSidebarOpen && (
          <div className="w-80 flex-shrink-0 border-r border-yellow-300/20">
            <Sidebar loading={laoding} messages={llmMessages} steps={steps} handleSend={handleSend} templateSet={templateSet} />
          </div>
        )}

        {/* File Explorer */}
        <div className="w-64 flex-shrink-0 border-r border-yellow-300/20">
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Header */}
          <div className="h-12 bg-gray-900 border-b border-yellow-300/20 flex items-center px-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'code'
                    ? 'bg-yellow-300 text-gray-950'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-yellow-300 text-gray-950'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
              webcontainer && <Preview files={files} webContainer={webcontainer} />
            )}
          </div>
        </div>
      </div>
    </div>
  )};
