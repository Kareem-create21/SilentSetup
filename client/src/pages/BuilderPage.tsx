import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Save, Download, Eye, EyeOff, Check, Link2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { InstallerProject } from "@shared/schema";
import { useInstaller } from "@/context/InstallerContext";
import { FileDropZone } from "@/components/FileDropZone";
import { FileList } from "@/components/FileList";
import { InstallerSettings } from "@/components/InstallerSettings";
import { CompressionSettings } from "@/components/CompressionSettings";
import { InstallerPreview } from "@/components/InstallerPreview";

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { currentProject, setCurrentProject, selectedFiles, previewMode, setPreviewMode } = useInstaller();
  const [activeTab, setActiveTab] = useState<string>("files");
  const [generatedFileId, setGeneratedFileId] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string | null>(null);

  // Fetch project if id is provided
  const { data: project, isLoading: isLoadingProject } = useQuery<InstallerProject>({
    queryKey: id ? [`/api/projects/${id}`] : null,
    enabled: !!id,
  });

  // Set project in context when loaded
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (project: Partial<InstallerProject>) => {
      if (!currentProject?.id) {
        throw new Error("No project to update");
      }
      const response = await apiRequest("PATCH", `/api/projects/${currentProject.id}`, project);
      return response.json();
    },
    onSuccess: (data: InstallerProject) => {
      setCurrentProject(data);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Project",
        description: error.message || "There was an error saving your project.",
        variant: "destructive",
      });
    },
  });

  // Build installer mutation
  const buildInstallerMutation = useMutation({
    mutationFn: async () => {
      if (!currentProject?.id) {
        throw new Error("No project to build");
      }
      const response = await apiRequest("POST", `/api/projects/${currentProject.id}/build`, {});
      return response.json();
    },
    onSuccess: (data) => {
      // Save the file ID for download
      if (data.fileId) {
        setGeneratedFileId(data.fileId);
        setGeneratedFileName(data.filePath || "installer.exe");
      }
      
      toast({
        title: "Installer Generated",
        description: `Your installer has been created successfully and is ready to download.`,
      });
    },
    onError: (error) => {
      // Reset file ID if there's an error
      setGeneratedFileId(null);
      setGeneratedFileName(null);
      
      toast({
        title: "Error Building Installer",
        description: error.message || "There was an error building your installer.",
        variant: "destructive",
      });
    },
  });
  
  // Handle download of the generated installer
  const handleDownloadInstaller = () => {
    if (!generatedFileId) {
      toast({
        title: "No Installer Available",
        description: "Please generate an installer first.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a download link to the installer
    const downloadUrl = `/api/download/${generatedFileId}`;
    
    // Open the download in a new tab
    window.open(downloadUrl, '_blank');
  };

  // Save current project
  const handleSaveProject = async () => {
    if (currentProject) {
      // Update the files in the project from context
      await updateProjectMutation.mutateAsync({
        ...currentProject,
        files: selectedFiles,
      });
    }
  };

  // Build the installer
  const handleBuildInstaller = async () => {
    if (currentProject) {
      // First save the latest changes
      await handleSaveProject();
      // Then build the installer
      await buildInstallerMutation.mutateAsync();
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {currentProject?.name || "New Installer"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={togglePreview}
              className="gap-2"
            >
              {previewMode ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide Preview</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="gap-2"
              onClick={handleSaveProject}
              disabled={updateProjectMutation.isPending}
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
            
            {generatedFileId ? (
              <Button
                className="gap-2"
                variant="default"
                onClick={handleDownloadInstaller}
              >
                <Link2 className="h-4 w-4" />
                <span>Download Installer</span>
              </Button>
            ) : (
              <Button
                className="gap-2"
                onClick={handleBuildInstaller}
                disabled={buildInstallerMutation.isPending || !currentProject}
              >
                <Download className="h-4 w-4" />
                <span>Build Installer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        {previewMode ? (
          <InstallerPreview />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - File selection */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="compression">Compression</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="files" className="flex-1 flex flex-col m-0 p-4 pt-0">
                    <FileDropZone />
                    {selectedFiles.length > 0 && <FileList />}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="m-0 p-4 pt-0">
                    <InstallerSettings 
                      isLoading={isLoadingProject} 
                      onSave={handleSaveProject} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="compression" className="m-0 p-4 pt-0">
                    <CompressionSettings 
                      onSave={handleSaveProject}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
            
            {/* Right column - Preview */}
            <div className="hidden md:block">
              <Card className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Preview</h3>
                  <InstallerPreview miniMode />
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Build status */}
        {buildInstallerMutation.isPending && (
          <Card className="bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Building installer...</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
