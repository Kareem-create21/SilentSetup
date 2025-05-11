import { useState } from 'react';
import { useInstaller } from '@/context/InstallerContext';
import { FileItem } from '@shared/schema';
import { formatFileSize, calculateTotalSize } from '@/lib/builderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  File, 
  Folder, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Trash2,
  FileText
} from 'lucide-react';

interface FileItemProps {
  file: FileItem;
  level?: number;
  onRemove: (id: string) => void;
}

const FileItemComponent = ({ file, level = 0, onRemove }: FileItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const toggleFolder = () => {
    if (file.isDirectory) {
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <>
      <div 
        className={`
          flex items-center justify-between py-2 px-2 rounded-md 
          transition-all duration-200 ease-in-out
          ${level === 0 ? 'hover:bg-muted hover:scale-[1.01]' : ''}
          ${isHovered && level === 0 ? 'bg-muted shadow-sm' : ''}
          animate-fadeIn
        `}
        style={{ 
          paddingLeft: `${level * 16 + 8}px`,
          animationDelay: `${level * 50}ms`,
          animationDuration: '300ms'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          {file.isDirectory ? (
            <Button
              variant="ghost"
              size="icon"
              className={`
                h-5 w-5 transition-transform duration-200
                ${isOpen ? 'rotate-0' : '-rotate-90'}
              `}
              onClick={toggleFolder}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-5"></div>
          )}
          
          {file.isDirectory ? (
            <Folder className={`
              h-4 w-4 text-blue-500 flex-shrink-0
              transition-all duration-200
              ${isHovered && level === 0 ? 'scale-110 text-blue-600' : ''}
            `} />
          ) : (
            <FileText className={`
              h-4 w-4 text-gray-500 flex-shrink-0
              transition-all duration-200
              ${isHovered && level === 0 ? 'scale-110 text-gray-700' : ''}
            `} />
          )}
          
          <span className={`
            text-sm truncate transition-colors duration-200
            ${isHovered && level === 0 ? 'text-primary font-medium' : ''}
          `}>
            {file.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          
          {level === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className={`
                h-6 w-6 text-muted-foreground 
                transition-all duration-200
                ${isHovered ? 'text-destructive opacity-100 scale-110' : 'opacity-60 hover:text-destructive'}
              `}
              onClick={() => onRemove(file.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {file.isDirectory && file.children && (
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-bounce
            ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {file.children.map((child, index) => (
            <FileItemComponent
              key={child.id}
              file={child}
              level={level + 1}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </>
  );
};

export function FileList() {
  const { selectedFiles, removeFile, clearFiles } = useInstaller();
  const totalSize = calculateTotalSize(selectedFiles);
  
  return (
    <div className="mt-4 space-y-4 animate-scaleIn" style={{ animationDuration: '400ms' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-xs text-primary
              transition-all duration-300 ${selectedFiles.length > 0 ? 'scale-100' : 'scale-0'}
            `}
          >
            {selectedFiles.length}
          </span>
          <span>Files to Include</span>
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          onClick={clearFiles}
          disabled={selectedFiles.length === 0}
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear All</span>
        </Button>
      </div>
      
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardContent className="p-0">
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-2 space-y-1">
              {selectedFiles.length > 0 ? (
                selectedFiles.map((file, index) => (
                  <FileItemComponent
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground transition-all duration-300 animate-pulse">
                  <File className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p>Drag and drop files or folders to add them</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex justify-between text-sm transition-all duration-300">
        <span className={`
          text-muted-foreground px-2 py-1 rounded-full bg-muted/50
          ${selectedFiles.length > 0 ? 'opacity-100' : 'opacity-0'}
        `}>
          Total size: {formatFileSize(totalSize)}
        </span>
      </div>
    </div>
  );
}
