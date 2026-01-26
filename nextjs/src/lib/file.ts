import { FileItem } from "@/types/file.type";

// Sort function to put folders before files
const sortItems = (items: FileItem[]) => {
    return items.sort((a, b) => {
      // Folders (type === 'folder') come before files (type === 'file')
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      
      // If both are the same type, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };
  
  // Apply recursively to all levels
  export const sortFileStructure = (items: FileItem[]): FileItem[] => {
    return sortItems(items).map(item => {
      if (item.type === 'folder' && item.children) {
        return {
          ...item,
          children: sortFileStructure(item.children)
        };
      }
      return item;
    });
  };
  