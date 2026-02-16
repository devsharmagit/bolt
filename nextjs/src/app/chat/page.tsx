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
import { Code2, Eye } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { chatStorage } from '@/lib/localStorage';


export default function ChatPage() {
  const [initialPrompt, setInitialPrompt] = useState('');

  const [loading, setLoading] = useState(false);
  const [remainingPrompts, setRemainingPrompts] = useState<number | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const [llmMessages, setLlmMessages] = useState<LlmMessage[]>([]);
  const { toasts, showToast, dismissToast } = useToast();

  const webcontainer = useWebContainer();
  console.log("webcontainer is called");
  console.log(webcontainer);

  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [files, setFiles] = useState<FileItem[]>([]);

  // Load initial prompt from sessionStorage
  useEffect(() => {
    const prompt = chatStorage.loadInitialPrompt();
    if (prompt) {
      setInitialPrompt(prompt);
    }
    
    // Load chat history from localStorage
    const savedHistory = chatStorage.loadHistory();
    if (savedHistory.length > 0) {
      setLlmMessages(savedHistory);
      showToast('Chat history restored', 'success');
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (llmMessages.length > 0) {
      chatStorage.saveHistory(llmMessages);
    }
  }, [llmMessages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        showToast(`Sidebar ${!isSidebarOpen ? 'opened' : 'closed'}`, 'info');
      }
      
      // Cmd+E / Ctrl+E: Toggle between code and preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setActiveTab((prev) => {
          const newTab = prev === 'code' ? 'preview' : 'code';
          showToast(`Switched to ${newTab}`, 'info');
          return newTab;
        });
      }

      // Cmd+Shift+C / Ctrl+Shift+C: Clear chat history
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        if (confirm('Clear chat history? This cannot be undone.')) {
          chatStorage.clearHistory();
          setLlmMessages([]);
          showToast('Chat history cleared', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isSidebarOpen, showToast]);

  useEffect(() => {
    const init = async (initialPrompt: string) => {
      const response = await templateAction(initialPrompt);
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
        const stepsResponse = await chatAction([
          ...injectedPrompts,
          { role: "user", content: initialPrompt, displayInChat: true }
        ]);
        setLoading(false);
        setRemainingPrompts(stepsResponse.remainingPrompts);

        if (stepsResponse.error) {
          setRateLimitMessage(stepsResponse.error);
          showToast(stepsResponse.error, 'error');
          return;
        }
        setRateLimitMessage(null);
        showToast('Project generated successfully!', 'success');

        if (stepsResponse?.response) {
          const responseText = stepsResponse.response;

          // Calculate next available ID from current steps
          setSteps((prevSteps) => {
            const maxId = prevSteps.length > 0 ? Math.max(...prevSteps.map(s => s.id)) : 0;
            const parsedSteps = parseXml(responseText, maxId + 1);
            return [...prevSteps, ...parsedSteps];
          });

          // Always show the initialPrompt as the first user message in the chat timeline
          setLlmMessages([
            { role: "user", content: initialPrompt, displayInChat: true },
            { role: "assistant", content: responseText }
          ]);
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
    try {
      const stepsResponse = await chatAction([
        ...llmMessages.filter(m => m.displayInChat !== false),
        { role: "user", content: prompt, displayInChat: true }
      ]);
      setLoading(false);
      setRemainingPrompts(stepsResponse.remainingPrompts);

      if (stepsResponse.error) {
        setRateLimitMessage(stepsResponse.error);
        showToast(stepsResponse.error, 'error');
        return;
      }
      setRateLimitMessage(null);

      if (!stepsResponse?.response) {
        showToast('No response from AI. Please try again.', 'error');
        console.error('No response from chat action');
        return;
      }

      showToast('Response generated successfully!', 'success');

      const responseText = stepsResponse.response;

      setLlmMessages(x => [
        ...x,
        { role: "user", content: prompt, displayInChat: true },
        { role: "assistant", content: responseText }
      ]);

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
    } catch (error) {
      setLoading(false);
      showToast('An error occurred. Please try again.', 'error');
      console.error('Error in handleSend:', error);
    }
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
            <Sidebar
              loading={loading}
              messages={llmMessages}
              steps={steps}
              handleSend={handleSend}
              remainingPrompts={remainingPrompts}
              rateLimitMessage={rateLimitMessage}
            />
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
                <span className="inline-flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Code
                </span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-yellow-300 text-gray-950'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative">
            <div
              className={
                `absolute inset-0 transition-opacity duration-200 ${activeTab === 'code' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
              }
            >
              <CodeEditor
                selectedFile={selectedFile}
                content={getFileContent(selectedFile)}
              />
            </div>
            <div
              className={
                `absolute inset-0 transition-opacity duration-200 ${activeTab === 'preview' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
              }
            >
              {webcontainer && <Preview files={files} webContainer={webcontainer} />}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
