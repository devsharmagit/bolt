'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { FileItem } from '@/types/file.type';

interface FileExplorerProps {
  files: FileItem[];
  selectedFile: string;
  onFileSelect: (path: string) => void;
}

export default function FileExplorer({ files, selectedFile, onFileSelect }: FileExplorerProps) {

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileNode = (node: FileItem, depth: number = 0, parentPath: string = '') => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(node.name);
    const isSelected = selectedFile === currentPath || selectedFile.endsWith(node.name);

    return (
      <div key={currentPath}>
        <div
          className={`flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-gray-800 transition-colors ${
            isSelected ? 'bg-indigo-500/20 text-indigo-300 border-r-2 border-indigo-500' : 'text-gray-300'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.name);
            } else {
              onFileSelect(currentPath);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 text-gray-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 mr-2 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 mr-2 text-blue-400" />
              )}
              <span>{node.name}</span>
            </>
          ) : (
            <>
              <span className="w-4 mr-1"></span>
              <File className="w-4 h-4 mr-2 text-gray-400" />
              <span>{node.name}</span>
            </>
          )}
        </div>
        
        {node.type === 'folder' && node.children && isExpanded && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-900 border-l border-gray-800">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-300 flex items-center">
          <Folder className="w-4 h-4 mr-2 text-blue-400" />
          Files
        </h3>
      </div>
      <div className="overflow-y-auto h-full">
        <div className="py-2">
          {files.map(file => renderFileNode(file))}
        </div>
      </div>
    </div>
  );
}
