import { createContext, useContext, useState, ReactNode } from "react";
import { FileItem, InstallerProject } from "@shared/schema";

interface InstallerContextType {
  currentProject: InstallerProject | null;
  setCurrentProject: (project: InstallerProject | null) => void;
  selectedFiles: FileItem[];
  addFiles: (files: FileItem[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => void;
}

const InstallerContext = createContext<InstallerContextType | undefined>(undefined);

export const InstallerProvider = ({ children }: { children: ReactNode }) => {
  const [currentProject, setCurrentProject] = useState<InstallerProject | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addFiles = (files: FileItem[]) => {
    // Add files, avoiding duplicates by id
    setSelectedFiles(prevFiles => {
      const existingIds = new Set(prevFiles.map(file => file.id));
      const newFiles = files.filter(file => !existingIds.has(file.id));
      return [...prevFiles, ...newFiles];
    });
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <InstallerContext.Provider
      value={{
        currentProject,
        setCurrentProject,
        selectedFiles,
        addFiles,
        removeFile,
        clearFiles,
        isDragging,
        setIsDragging,
        previewMode,
        setPreviewMode
      }}
    >
      {children}
    </InstallerContext.Provider>
  );
};

export const useInstaller = () => {
  const context = useContext(InstallerContext);
  if (context === undefined) {
    throw new Error("useInstaller must be used within an InstallerProvider");
  }
  return context;
};
