import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Upload, AlertCircle, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInstaller } from '@/context/InstallerContext';
import { processDroppedItems } from '@/lib/builderService';
import { FileItem } from '@shared/schema';

export function FileDropZone() {
  const { addFiles, isDragging, setIsDragging } = useInstaller();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Set up drag and drop event handlers
  useEffect(() => {
    const dropArea = dropRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === dropArea) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (!e.dataTransfer) return;
      
      try {
        setError(null);
        setIsProcessing(true);
        
        // Process the dropped items
        const items = e.dataTransfer.items;
        if (items.length > 0) {
          const fileItems = await processDroppedItems(items);
          if (fileItems.length > 0) {
            const totalCount = countFilesAndFolders(fileItems);
            addFiles(fileItems);
            toast({
              title: "Items Added",
              description: `Added ${totalCount.files} file${totalCount.files === 1 ? '' : 's'} and ${totalCount.folders} folder${totalCount.folders === 1 ? '' : 's'} to your installer.`,
            });
          }
        }
      } catch (err) {
        console.error('Error processing dropped files:', err);
        setError('There was an error processing the dropped files. Please try again.');
        toast({
          title: "Error Adding Files",
          description: "There was an error processing the dropped files.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [addFiles, setIsDragging, toast]);

  // Handle file input change
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      const fileItems = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        path: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        isDirectory: false
      }));
      
      addFiles(fileItems);
      
      toast({
        title: "Files Added",
        description: `Added ${fileItems.length} file${fileItems.length === 1 ? '' : 's'} to your installer.`,
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error processing selected files:', err);
      setError('There was an error processing the selected files. Please try again.');
      toast({
        title: "Error Adding Files",
        description: "There was an error processing the selected files.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle folder input change
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setError(null);
      setIsProcessing(true);
      
      // Process directory using DataTransferItemList if available
      if (e.target.webkitEntries && e.target.webkitEntries.length > 0) {
        const entries = Array.from(e.target.webkitEntries);
        const fileItems = await Promise.all(
          entries.map(async (entry) => {
            if (entry.isDirectory) {
              return await processDirectoryEntry(entry as FileSystemDirectoryEntry);
            } else if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry;
              const file = await getFileFromEntry(fileEntry);
              return {
                id: crypto.randomUUID(),
                name: file.name,
                path: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                isDirectory: false
              };
            }
            return null;
          })
        ).then(items => items.filter(Boolean) as FileItem[]);
        
        if (fileItems.length > 0) {
          addFiles(fileItems);
          const totalCount = countFilesAndFolders(fileItems);
          toast({
            title: "Folder Added",
            description: `Added ${totalCount.files} file${totalCount.files === 1 ? '' : 's'} and ${totalCount.folders} folder${totalCount.folders === 1 ? '' : 's'} to your installer.`,
          });
        }
      } else {
        // Fallback for browsers without webkitEntries support
        const folderName = e.target.files[0].webkitRelativePath.split('/')[0];
        const fileItems = Array.from(e.target.files).map(file => {
          // Extract relative path starting after the first folder
          const path = file.webkitRelativePath.substring(folderName.length + 1);
          return {
            id: crypto.randomUUID(),
            name: file.name,
            path: file.webkitRelativePath,
            size: file.size,
            type: file.type || 'application/octet-stream',
            isDirectory: false
          };
        });
        
        // Create a folder structure from the files
        const folderStructure = createFolderStructure(fileItems, folderName);
        
        if (folderStructure) {
          addFiles([folderStructure]);
          toast({
            title: "Folder Added",
            description: `Added folder "${folderName}" to your installer.`,
          });
        }
      }
      
      // Reset the folder input
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error processing selected folder:', err);
      setError('There was an error processing the selected folder. Please try again.');
      toast({
        title: "Error Adding Folder",
        description: "There was an error processing the selected folder.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get a File from a FileEntry
  const getFileFromEntry = (fileEntry: FileSystemFileEntry): Promise<File> => {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
  };

  // Helper function to process a directory entry
  const processDirectoryEntry = async (dirEntry: FileSystemDirectoryEntry): Promise<FileItem> => {
    const reader = dirEntry.createReader();
    let entries: FileSystemEntry[] = [];
    let result: FileSystemEntry[] = [];
    
    // Read all entries in the directory
    do {
      result = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        reader.readEntries(resolve, reject);
      });
      entries = entries.concat(result);
    } while (result.length > 0);
    
    // Process all entries
    const children = await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory) {
          return await processDirectoryEntry(entry as FileSystemDirectoryEntry);
        } else {
          const fileEntry = entry as FileSystemFileEntry;
          const file = await getFileFromEntry(fileEntry);
          return {
            id: crypto.randomUUID(),
            name: file.name,
            path: entry.fullPath.slice(1), // Remove leading slash
            size: file.size,
            type: file.type || 'application/octet-stream',
            isDirectory: false
          };
        }
      })
    );
    
    // Calculate total size of the directory
    const totalSize = children.reduce((sum, item) => sum + item.size, 0);
    
    return {
      id: crypto.randomUUID(),
      name: dirEntry.name,
      path: dirEntry.fullPath.slice(1), // Remove leading slash
      size: totalSize,
      type: 'directory',
      isDirectory: true,
      children
    };
  };

  // Helper function to create a folder structure from flat files
  const createFolderStructure = (files: FileItem[], rootFolderName: string): FileItem | null => {
    if (files.length === 0) return null;
    
    // Map to store folders by path
    const folderMap = new Map<string, FileItem>();
    
    // Create root folder
    const rootFolder: FileItem = {
      id: crypto.randomUUID(),
      name: rootFolderName,
      path: rootFolderName,
      size: 0,
      type: 'directory',
      isDirectory: true,
      children: []
    };
    
    folderMap.set(rootFolderName, rootFolder);
    
    // Process each file
    files.forEach(file => {
      const pathParts = file.path.split('/');
      
      // Build folder structure
      let currentPath = rootFolderName;
      for (let i = 1; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const nextPath = `${currentPath}/${folderName}`;
        
        if (!folderMap.has(nextPath)) {
          const newFolder: FileItem = {
            id: crypto.randomUUID(),
            name: folderName,
            path: nextPath,
            size: 0,
            type: 'directory',
            isDirectory: true,
            children: []
          };
          
          // Add folder to its parent
          const parentFolder = folderMap.get(currentPath);
          if (parentFolder && parentFolder.children) {
            parentFolder.children.push(newFolder);
          }
          
          folderMap.set(nextPath, newFolder);
        }
        
        currentPath = nextPath;
      }
      
      // Add file to the deepest folder
      const parentFolder = folderMap.get(currentPath);
      if (parentFolder && parentFolder.children) {
        parentFolder.children.push(file);
        
        // Update folder sizes
        let path = currentPath;
        while (path) {
          const folder = folderMap.get(path);
          if (folder) {
            folder.size += file.size;
            const lastSlash = path.lastIndexOf('/');
            path = lastSlash > 0 ? path.substring(0, lastSlash) : '';
          } else {
            break;
          }
        }
      }
    });
    
    return rootFolder;
  };

  // Helper function to count files and folders
  const countFilesAndFolders = (items: FileItem[]): { files: number; folders: number } => {
    let files = 0;
    let folders = 0;
    
    const countItem = (item: FileItem) => {
      if (item.isDirectory) {
        folders++;
        if (item.children) {
          item.children.forEach(countItem);
        }
      } else {
        files++;
      }
    };
    
    items.forEach(countItem);
    return { files, folders };
  };

  // Trigger file input click
  const handleBrowseFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Trigger folder input click
  const handleBrowseFolderClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        className="hidden"
        webkitdirectory=""
        directory=""
      />
      
      <div
        ref={dropRef}
        className={`
          relative border-2 border-dashed rounded-lg p-8 
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' 
            : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/5'
          }
          ${isProcessing ? 'opacity-70' : ''}
        `}
      >
        {/* Animated dots background for drag state */}
        {isDragging && (
          <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-primary/10" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', 
                   backgroundSize: '20px 20px',
                   animation: 'moveBackground 3s linear infinite'
                 }}>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
          <div className={`
            w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${isDragging ? 'scale-110 bg-primary/20' : ''}
          `}>
            <Upload className={`
              h-8 w-8 text-primary
              transition-transform duration-300 ease-bounce
              ${isDragging ? 'scale-110 animate-bounce' : ''}
            `} />
          </div>
          
          <div className="space-y-2">
            <h3 className={`
              font-semibold text-lg
              transition-all duration-300
              ${isDragging ? 'text-primary scale-105' : ''}
            `}>
              {isDragging ? 'Drop files here' : 'Drag files or folders here'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md transition-opacity duration-300">
              {isDragging 
                ? 'Release to add files to your installer package'
                : 'Drag and drop files or entire folders to add them to your installer package, or use the buttons below to browse'
              }
            </p>
          </div>
          
          <div className={`
            flex flex-wrap justify-center gap-3
            transition-opacity duration-300
            ${isDragging ? 'opacity-50' : ''}
          `}>
            <Button 
              onClick={handleBrowseFilesClick}
              variant="outline"
              className="gap-2 transition-all duration-200 hover:scale-105"
              disabled={isProcessing || isDragging}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Browse Files</span>
            </Button>
            
            <Button 
              onClick={handleBrowseFolderClick}
              variant="outline"
              className="gap-2 transition-all duration-200 hover:scale-105"
              disabled={isProcessing || isDragging}
            >
              <FolderPlus className="h-4 w-4" />
              <span>Browse Folders</span>
            </Button>
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-pulse">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Processing files...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 text-sm text-destructive animate-bounce">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
