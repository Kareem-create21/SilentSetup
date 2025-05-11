import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileSchema, insertInstallerProjectSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import os from "os";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API routes under /api prefix
  const apiRouter = app.route("/api");

  // Get all installer projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllInstallerProjects();
      return res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      return res.status(500).json({ message: "Failed to retrieve projects" });
    }
  });

  // Get a specific installer project
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getInstallerProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      return res.status(500).json({ message: "Failed to retrieve project" });
    }
  });

  // Create a new installer project
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const result = insertInstallerProjectSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: result.error.format() 
        });
      }

      // Add current timestamp
      const projectData = {
        ...result.data,
        created: new Date().toISOString()
      };

      const newProject = await storage.createInstallerProject(projectData);
      return res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      return res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update an installer project
  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Check if project exists
      const existingProject = await storage.getInstallerProject(id);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      const updatedProject = await storage.updateInstallerProject(id, req.body);
      return res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete an installer project
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const success = await storage.deleteInstallerProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      return res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Add files to a project
  app.post("/api/projects/:id/files", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      // Validate files array
      const filesSchema = z.array(fileSchema);
      const result = filesSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid file data", 
          errors: result.error.format() 
        });
      }

      const updatedProject = await storage.addFilesToProject(id, result.data);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.json(updatedProject);
    } catch (error) {
      console.error("Error adding files:", error);
      return res.status(500).json({ message: "Failed to add files to project" });
    }
  });

  // Remove a file from a project
  app.delete("/api/projects/:id/files/:fileId", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const { fileId } = req.params;
      if (!fileId) {
        return res.status(400).json({ message: "File ID is required" });
      }

      const updatedProject = await storage.removeFileFromProject(id, fileId);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project or file not found" });
      }

      return res.json(updatedProject);
    } catch (error) {
      console.error("Error removing file:", error);
      return res.status(500).json({ message: "Failed to remove file from project" });
    }
  });

  // Generate installer
  app.post("/api/projects/:id/build", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const result = await storage.generateInstaller(id);
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Failed to generate installer" });
      }

      return res.json(result);
    } catch (error) {
      console.error("Error generating installer:", error);
      return res.status(500).json({ message: "Failed to generate installer" });
    }
  });

  // Get system folders for default installation paths
  app.get("/api/system/folders", (req: Request, res: Response) => {
    try {
      const programFiles = process.platform === 'win32' 
        ? process.env.ProgramFiles || 'C:\\Program Files'
        : '/usr/local';
        
      const appData = process.platform === 'win32' 
        ? process.env.APPDATA || path.join(os.homedir(), 'AppData\\Roaming')
        : path.join(os.homedir(), '.local/share');
        
      return res.json({
        programFiles,
        appData,
        home: os.homedir()
      });
    } catch (error) {
      console.error("Error getting system folders:", error);
      return res.status(500).json({ message: "Failed to retrieve system folders" });
    }
  });
  
  // Download generated installer
  app.get("/api/download/:fileId", (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        return res.status(400).json({ message: "File ID is required" });
      }
      
      // Get the file path from storage
      const filePath = storage.getInstallerFilePath(fileId);
      
      if (!filePath) {
        return res.status(404).json({ message: "Installer file not found" });
      }
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Installer file does not exist on server" });
      }
      
      // Get filename from path
      const fileName = path.basename(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading installer:", error);
      return res.status(500).json({ message: "Failed to download installer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
