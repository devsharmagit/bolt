'use client';
import { FileItem } from '@/types/file.type';
import JSZip from 'jszip';
import Link from 'next/link';

interface NavbarProps {
  files: FileItem[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ files, isSidebarOpen, onToggleSidebar }: NavbarProps) {
  
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
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-gray-950 text-sm font-medium rounded-lg transition-colors"
      >
        Download Source Code
      </button>
    </nav>
  );
}
