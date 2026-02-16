'use client';
import { FileItem } from '@/types/file.type';
import JSZip from 'jszip';
import Link from 'next/link';
import { useState } from 'react';
import { Keyboard } from 'lucide-react';

interface NavbarProps {
  files: FileItem[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ files, isSidebarOpen, onToggleSidebar }: NavbarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const addFilesToZip = (zip: JSZip, items: FileItem[], basePath: string = '') => {
    items.forEach(item => {
      const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
      
      if (item.type === 'folder' && item.children) {
        const folder = zip.folder(fullPath);
        if (folder) {
          addFilesToZip(zip, item.children, fullPath);
        }
      } else if (item.type === 'file' && item.content) {
        zip.file(fullPath, item.content);
      }
    });
  };

  const handleDownload = async () => {
    if (files.length === 0) {
      alert('No files to download');
      return;
    }

    const zip = new JSZip();
    
    // Add all files and folders to the zip
    addFilesToZip(zip, files);

    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bolt-project-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <nav className="h-14 bg-gray-950 border-b border-yellow-300/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            className="w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <Link href="/" className="text-xl font-bold text-white hover:text-yellow-200 transition-colors">
          Bolt
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowShortcuts(true)}
          className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-gray-950 text-sm font-medium rounded-lg transition-colors"
        >
          Download Source Code
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-gray-900 rounded-xl border border-yellow-300/30 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-yellow-300" />
              Keyboard Shortcuts
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Toggle sidebar</span>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300">
                  Cmd/Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Toggle code/preview</span>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300">
                  Cmd/Ctrl + E
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Clear chat history</span>
                <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-300">
                  Cmd/Ctrl + Shift + C
                </kbd>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-gray-950 text-sm font-medium rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
