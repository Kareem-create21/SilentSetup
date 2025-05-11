import { installerProjects, type InstallerProject, type InsertInstallerProject, type FileItem } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import os from 'os';

// Storage interface for CRUD operations
export interface IStorage {
  // Installer project operations
  getAllInstallerProjects(): Promise<InstallerProject[]>;
  getInstallerProject(id: number): Promise<InstallerProject | undefined>;
  createInstallerProject(project: InsertInstallerProject): Promise<InstallerProject>;
  updateInstallerProject(id: number, project: Partial<InstallerProject>): Promise<InstallerProject | undefined>;
  deleteInstallerProject(id: number): Promise<boolean>;
  
  // File management
  addFilesToProject(projectId: number, files: FileItem[]): Promise<InstallerProject | undefined>;
  removeFileFromProject(projectId: number, fileId: string): Promise<InstallerProject | undefined>;
  
  // Build operations
  generateInstaller(projectId: number): Promise<{ success: boolean; filePath?: string; fileId?: string; error?: string }>;
  
  // Download operations
  getInstallerFilePath(fileId: string): string | undefined;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private projects: Map<number, InstallerProject>;
  private currentId: number;
  private generatedInstallers: Map<string, { filePath: string, projectId: number }>;
  private outputDir: string;

  constructor() {
    this.projects = new Map();
    this.currentId = 1;
    this.generatedInstallers = new Map();
    
    // Create output directory for generated installers
    this.outputDir = path.join(os.tmpdir(), 'installer-builder');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async getAllInstallerProjects(): Promise<InstallerProject[]> {
    return Array.from(this.projects.values());
  }

  async getInstallerProject(id: number): Promise<InstallerProject | undefined> {
    return this.projects.get(id);
  }

  async createInstallerProject(project: InsertInstallerProject): Promise<InstallerProject> {
    const id = this.currentId++;
    const newProject: InstallerProject = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateInstallerProject(id: number, projectUpdates: Partial<InstallerProject>): Promise<InstallerProject | undefined> {
    const existingProject = this.projects.get(id);
    
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { 
      ...existingProject, 
      ...projectUpdates 
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteInstallerProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async addFilesToProject(projectId: number, files: FileItem[]): Promise<InstallerProject | undefined> {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return undefined;
    }
    
    // Combine existing files with new files, avoiding duplicates by id
    const existingFileIds = new Set((project.files as FileItem[]).map(file => file.id));
    const newUniqueFiles = files.filter(file => !existingFileIds.has(file.id));
    
    const updatedFiles = [
      ...(project.files as FileItem[]),
      ...newUniqueFiles
    ];
    
    const updatedProject = {
      ...project,
      files: updatedFiles
    };
    
    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }
  
  async removeFileFromProject(projectId: number, fileId: string): Promise<InstallerProject | undefined> {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return undefined;
    }
    
    const updatedFiles = (project.files as FileItem[]).filter(file => file.id !== fileId);
    
    const updatedProject = {
      ...project,
      files: updatedFiles
    };
    
    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }
  
  async generateInstaller(projectId: number): Promise<{ success: boolean; filePath?: string; fileId?: string; error?: string }> {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return { 
        success: false, 
        error: "Project not found" 
      };
    }
    
    try {
      // Generate a unique ID for this installer file
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Create a safe filename
      const safeProjectName = project.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      
      // Determine file extension based on OS
      let extension = '.exe';  // Default for Windows
      if (process.platform === 'darwin') {
        extension = '.dmg';    // macOS
      } else if (process.platform === 'linux') {
        extension = '.run';    // Linux
      }
      
      const fileName = `${safeProjectName}-${project.version}-installer${extension}`;
      
      // Full path to the installer file
      const filePath = path.join(this.outputDir, fileName);
      
      // In a real implementation, this would actually build an installer
      // For this demo, we'll create a simple ZIP file
      await this.createDemoInstallerFile(filePath, project);
      
      // Store the file information for later download
      this.generatedInstallers.set(fileId, { filePath, projectId });
      
      return {
        success: true,
        filePath: fileName,
        fileId: fileId
      };
    } catch (error) {
      console.error("Error generating installer:", error);
      return {
        success: false,
        error: "Failed to generate installer file"
      };
    }
  }
  
  getInstallerFilePath(fileId: string): string | undefined {
    const installerInfo = this.generatedInstallers.get(fileId);
    
    if (!installerInfo) {
      console.log(`No installer found with ID ${fileId}`);
      console.log(`Available installers: ${Array.from(this.generatedInstallers.keys()).join(', ')}`);
      return undefined;
    }
    
    // Check if file exists
    if (!fs.existsSync(installerInfo.filePath)) {
      console.log(`Installer file not found at ${installerInfo.filePath}`);
      return undefined;
    }
    
    return installerInfo.filePath;
  }
  
  // Helper method to create a demo installer file (in this case, a ZIP file)
  private async createDemoInstallerFile(filePath: string, project: InstallerProject): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a file to write to
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', {
        zlib: { level: project.compressionLevel || 6 } // Set compression level
      });
      
      // Listen for all archive data to be written
      output.on('close', () => {
        resolve();
      });
      
      // Handle errors
      archive.on('error', (err) => {
        reject(err);
      });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Get the current platform
      const platform = process.platform;
      let platformName = 'Windows';
      let installScript = '';
      let uninstallScript = '';
      
      if (platform === 'darwin') {
        platformName = 'macOS';
        installScript = `#!/bin/bash
# macOS Install Script
echo "Installing ${project.name} v${project.version}..."
echo "Copying files to ${project.defaultInstallPath}..."
# Simulated installation commands for macOS
mkdir -p "${project.defaultInstallPath}"
# Installation commands would go here
echo "Installation complete!"
`;
        uninstallScript = `#!/bin/bash
# macOS Uninstall Script
echo "Uninstalling ${project.name}..."
echo "Removing files from ${project.defaultInstallPath}..."
# Simulated uninstallation commands for macOS
# rm -rf "${project.defaultInstallPath}"
echo "Uninstallation complete!"
`;
      } else if (platform === 'linux') {
        platformName = 'Linux';
        installScript = `#!/bin/bash
# Linux Install Script
echo "Installing ${project.name} v${project.version}..."
echo "Copying files to ${project.defaultInstallPath}..."
# Simulated installation commands for Linux
mkdir -p "${project.defaultInstallPath}"
# Installation commands would go here
echo "Installation complete!"
`;
        uninstallScript = `#!/bin/bash
# Linux Uninstall Script
echo "Uninstalling ${project.name}..."
echo "Removing files from ${project.defaultInstallPath}..."
# Simulated uninstallation commands for Linux
# rm -rf "${project.defaultInstallPath}"
echo "Uninstallation complete!"
`;
      } else {
        // Windows
        installScript = `@echo off
REM Windows Install Script
echo Installing ${project.name} v${project.version}...
echo Copying files to ${project.defaultInstallPath}...
REM Simulated installation commands for Windows
mkdir "${project.defaultInstallPath}"
REM Installation commands would go here
echo Installation complete!
`;
        uninstallScript = `@echo off
REM Windows Uninstall Script
echo Uninstalling ${project.name}...
echo Removing files from ${project.defaultInstallPath}...
REM Simulated uninstallation commands for Windows
REM rd /s /q "${project.defaultInstallPath}"
echo Uninstallation complete!
`;
      }
      
      // Add a readme file with project info
      const readme = `
        ${project.name} v${project.version}
        Published by: ${project.publisher}
        Platform: ${platformName}
        
        Description:
        ${project.description || 'No description provided.'}
        
        This is a demo installer created with Installer Builder.
        Default installation path: ${project.defaultInstallPath}
        
        Included files:
        ${(project.files as FileItem[]).map(file => `- ${file.path} (${formatFileSize(file.size)})`).join('\n        ')}
      `;
      
      archive.append(readme, { name: 'README.txt' });
      
      // Include platform-specific install/uninstall scripts
      if (platform === 'win32') {
        archive.append(installScript, { name: 'install.bat' });
        archive.append(uninstallScript, { name: 'uninstall.bat' });
      } else {
        archive.append(installScript, { name: 'install.sh', mode: 0o755 });
        archive.append(uninstallScript, { name: 'uninstall.sh', mode: 0o755 });
      }
      
      // Include some demo files to simulate the installer content
      archive.append('This is a demo installer file.', { name: 'installer.info' });
      archive.append(JSON.stringify(project, null, 2), { name: 'project.json' });
      
      // Finalize the archive
      archive.finalize();
    });
  }
}

// Helper function to format file size 
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize and export the storage
export const storage = new MemStorage();
