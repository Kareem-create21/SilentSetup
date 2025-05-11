import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Tag, 
  Layers, 
  FileSearch, 
  FileLock2, 
  FileEdit, 
  Trash, 
  FolderDown,
  Link,
  RefreshCw
} from 'lucide-react';
import { FileItem, InstallerProject } from '@shared/schema';
import { useInstaller } from '@/context/InstallerContext';
import { formatFileSize } from '@/lib/builderService';
import { useToast } from '@/hooks/use-toast';

interface FileOperationsProps {
  selectedFiles: FileItem[];
  onFilesUpdated: (files: FileItem[]) => void;
}

export function FileOperations({ selectedFiles, onFilesUpdated }: FileOperationsProps) {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [excludePattern, setExcludePattern] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const { toast } = useToast();
  
  // List of categories found in files
  const availableCategories = Array.from(
    new Set(
      selectedFiles
        .filter(file => file.category)
        .map(file => file.category as string)
    )
  );
  
  // List of versions found in files
  const availableVersions = Array.from(
    new Set(
      selectedFiles
        .filter(file => file.version)
        .map(file => file.version as string)
    )
  );
  
  // Search files by name, path, or category
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results: FileItem[] = [];
    
    const searchInFiles = (files: FileItem[]) => {
      files.forEach(file => {
        if (
          file.name.toLowerCase().includes(query) ||
          file.path.toLowerCase().includes(query) ||
          (file.category && file.category.toLowerCase().includes(query))
        ) {
          results.push(file);
        }
        
        if (file.isDirectory && file.children) {
          searchInFiles(file.children);
        }
      });
    };
    
    searchInFiles(selectedFiles);
    setSearchResults(results);
  };
  
  // Handle adding a category to a file
  const handleAddCategory = (file: FileItem, category: string) => {
    const updatedFiles = updateFileInHierarchy(selectedFiles, file.id, {
      ...file,
      category
    });
    
    onFilesUpdated(updatedFiles);
    toast({
      title: "Category Added",
      description: `Added category "${category}" to ${file.name}`,
    });
  };
  
  // Handle excluding a file
  const handleExcludeFile = (file: FileItem, excluded: boolean) => {
    const updatedFiles = updateFileInHierarchy(selectedFiles, file.id, {
      ...file,
      excluded
    });
    
    onFilesUpdated(updatedFiles);
    toast({
      title: excluded ? "File Excluded" : "File Included",
      description: `${file.name} will ${excluded ? 'not' : 'now'} be included in the installer`,
    });
  };
  
  // Handle encrypting a file
  const handleEncryptFile = (file: FileItem, encrypted: boolean) => {
    const updatedFiles = updateFileInHierarchy(selectedFiles, file.id, {
      ...file,
      encrypted
    });
    
    onFilesUpdated(updatedFiles);
    toast({
      title: encrypted ? "File Encrypted" : "File Decrypted",
      description: `${file.name} will ${encrypted ? 'be encrypted' : 'not be encrypted'} in the installer`,
    });
  };
  
  // Handle excluding from minimal installation
  const handleExcludeFromMinimal = (file: FileItem, exclude: boolean) => {
    const updatedFiles = updateFileInHierarchy(selectedFiles, file.id, {
      ...file,
      excludeFromMinimal: exclude
    });
    
    onFilesUpdated(updatedFiles);
    toast({
      title: exclude ? "Excluded from Minimal" : "Included in Minimal",
      description: `${file.name} will ${exclude ? 'not' : 'now'} be included in minimal installations`,
    });
  };
  
  // Filter files by category
  const filteredFiles = selectedCategories.length > 0
    ? filterFilesByCategories(selectedFiles, selectedCategories)
    : selectedFiles;
    
  // Apply exclude pattern to files
  const handleApplyExcludePattern = () => {
    if (!excludePattern.trim()) return;
    
    try {
      const pattern = new RegExp(excludePattern);
      const updatedFiles = applyExcludePattern(selectedFiles, pattern);
      onFilesUpdated(updatedFiles);
      
      toast({
        title: "Exclude Pattern Applied",
        description: `Applied pattern "${excludePattern}" to files`,
      });
    } catch (error) {
      toast({
        title: "Invalid Pattern",
        description: "Please enter a valid regular expression",
        variant: "destructive",
      });
    }
  };
  
  // Helper to apply exclude pattern to files
  const applyExcludePattern = (files: FileItem[], pattern: RegExp): FileItem[] => {
    return files.map(file => {
      const matched = pattern.test(file.path);
      const updatedFile = {
        ...file,
        excluded: matched ? true : file.excluded
      };
      
      if (file.isDirectory && file.children) {
        updatedFile.children = applyExcludePattern(file.children, pattern);
      }
      
      return updatedFile;
    });
  };
  
  // Helper to filter files by categories
  const filterFilesByCategories = (files: FileItem[], categories: string[]): FileItem[] => {
    const result: FileItem[] = [];
    
    const filterRecursive = (inputFiles: FileItem[]) => {
      inputFiles.forEach(file => {
        if (file.category && categories.includes(file.category)) {
          result.push(file);
        }
        
        if (file.isDirectory && file.children) {
          filterRecursive(file.children);
        }
      });
    };
    
    filterRecursive(files);
    return result;
  };
  
  // Helper to update a file in the hierarchy
  const updateFileInHierarchy = (files: FileItem[], fileId: string, updatedFile: FileItem): FileItem[] => {
    return files.map(file => {
      if (file.id === fileId) {
        return updatedFile;
      }
      
      if (file.isDirectory && file.children) {
        return {
          ...file,
          children: updateFileInHierarchy(file.children, fileId, updatedFile)
        };
      }
      
      return file;
    });
  };
  
  // File detail view component
  const FileDetailView = ({ file }: { file: FileItem }) => {
    const [newVersion, setNewVersion] = useState(file.version || '');
    const [dependencies, setDependencies] = useState<string[]>(file.dependencies || []);
    const [newDependency, setNewDependency] = useState('');
    
    const handleAddDependency = () => {
      if (!newDependency.trim()) return;
      
      const newDependencies = [...dependencies, newDependency];
      setDependencies(newDependencies);
      
      // Update file in hierarchy
      const updatedFile = {
        ...file,
        dependencies: newDependencies
      };
      
      onFilesUpdated(updateFileInHierarchy(selectedFiles, file.id, updatedFile));
      setNewDependency('');
    };
    
    const handleRemoveDependency = (dependency: string) => {
      const newDependencies = dependencies.filter(d => d !== dependency);
      setDependencies(newDependencies);
      
      // Update file in hierarchy
      const updatedFile = {
        ...file,
        dependencies: newDependencies
      };
      
      onFilesUpdated(updateFileInHierarchy(selectedFiles, file.id, updatedFile));
    };
    
    const handleUpdateVersion = () => {
      if (!newVersion.trim()) return;
      
      // Update file in hierarchy
      const updatedFile = {
        ...file,
        version: newVersion
      };
      
      onFilesUpdated(updateFileInHierarchy(selectedFiles, file.id, updatedFile));
      
      toast({
        title: "Version Updated",
        description: `Updated version for ${file.name} to ${newVersion}`,
      });
    };
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {file.isDirectory ? (
              <Layers className="h-5 w-5 text-blue-500" />
            ) : (
              <FileEdit className="h-5 w-5 text-gray-500" />
            )}
            {file.name}
          </CardTitle>
          <CardDescription>{file.path}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Size</span>
            <span className="text-sm">{formatFileSize(file.size)}</span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">File Properties</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Excluded</span>
                <Switch 
                  checked={!!file.excluded} 
                  onCheckedChange={(checked) => handleExcludeFile(file, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Encrypted</span>
                <Switch 
                  checked={!!file.encrypted} 
                  onCheckedChange={(checked) => handleEncryptFile(file, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Exclude from Minimal</span>
                <Switch 
                  checked={!!file.excludeFromMinimal} 
                  onCheckedChange={(checked) => handleExcludeFromMinimal(file, checked)}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Version Control</h4>
            <div className="flex gap-2">
              <Input 
                placeholder="Version (e.g., 1.0.0)" 
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
              />
              <Button onClick={handleUpdateVersion} size="sm">Set</Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">File Categories</h4>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge 
                  key={category}
                  variant={file.category === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleAddCategory(file, category)}
                >
                  {category}
                </Badge>
              ))}
              <div className="flex gap-1 mt-2 w-full">
                <Input 
                  placeholder="New category name" 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  onClick={() => {
                    if (categoryName.trim()) {
                      handleAddCategory(file, categoryName);
                      setCategoryName('');
                    }
                  }} 
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Dependencies</h4>
            <div className="space-y-2">
              {dependencies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {dependencies.map((dep) => (
                    <Badge 
                      key={dep} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {dep}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveDependency(dep)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No dependencies added yet</p>
              )}
              <div className="flex gap-1">
                <Input 
                  placeholder="Add dependency" 
                  value={newDependency}
                  onChange={(e) => setNewDependency(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleAddDependency} size="sm">Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="categorize">
            <Tag className="h-4 w-4 mr-2" />
            Categorize
          </TabsTrigger>
          <TabsTrigger value="exclude">
            <Filter className="h-4 w-4 mr-2" />
            Exclude
          </TabsTrigger>
          <TabsTrigger value="dependency">
            <Link className="h-4 w-4 mr-2" />
            Dependencies
          </TabsTrigger>
        </TabsList>
        
        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search files by name, path, or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
              <span className="ml-2">Search</span>
            </Button>
          </div>
          
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="p-4 space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center space-x-2">
                      {file.isDirectory ? (
                        <Layers className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileEdit className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                      {file.category && (
                        <Badge variant="outline" className="text-xs">
                          {file.category}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSearch className="h-8 w-8 mx-auto mb-2" />
                  <p>No matching files found</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>Search for files by name, path, or category</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Categorize Tab */}
        <TabsContent value="categorize" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>File Categories</CardTitle>
                <CardDescription>
                  Create and manage categories for your installer files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="New category name" 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={() => {
                      if (!categoryName.trim()) return;
                      
                      if (selectedFile) {
                        handleAddCategory(selectedFile, categoryName);
                        setCategoryName('');
                      } else {
                        toast({
                          title: "Select a File",
                          description: "Please select a file to add this category to",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Tag className="h-4 w-4" />
                    <span className="ml-2">Add</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Available Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.length > 0 ? (
                      availableCategories.map((category) => (
                        <Badge 
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"} 
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                        >
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No categories defined yet</p>
                    )}
                  </div>
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium">Filtered by Categories:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCategories.map((category) => (
                        <Badge key={category}>
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setSelectedCategories([])}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-4 space-y-2">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className={`
                        flex items-center justify-between p-2 border rounded-md 
                        hover:bg-muted/50 cursor-pointer transition-colors
                        ${selectedFile?.id === file.id ? 'border-primary bg-primary/5' : ''}
                      `}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center space-x-2">
                        {file.isDirectory ? (
                          <Layers className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileEdit className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium">{file.name}</span>
                        {file.category && (
                          <Badge variant="outline" className="text-xs">
                            {file.category}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="h-8 w-8 mx-auto mb-2" />
                    <p>No files to display</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        
        {/* Exclude Tab */}
        <TabsContent value="exclude" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exclude Files</CardTitle>
              <CardDescription>
                Define patterns to exclude files from your installer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Exclude pattern (regex, e.g., \.log$)" 
                  value={excludePattern}
                  onChange={(e) => setExcludePattern(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleApplyExcludePattern}>
                  Apply Pattern
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example Patterns</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between p-2 border rounded-md">
                    <code>\.log$</code>
                    <span className="text-muted-foreground">Excludes all .log files</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded-md">
                    <code>^temp/</code>
                    <span className="text-muted-foreground">Excludes temp directory</span>
                  </div>
                  <div className="flex justify-between p-2 border rounded-md">
                    <code>(\.bak|\.tmp)$</code>
                    <span className="text-muted-foreground">Excludes .bak and .tmp files</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Excluded Files</CardTitle>
                <CardDescription>
                  Files that will not be included in your installer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {selectedFiles
                      .filter(file => file.excluded)
                      .length > 0 ? (
                      selectedFiles
                        .filter(file => file.excluded)
                        .map((file) => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <FileEdit className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.path}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleExcludeFile(file, false)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No excluded files</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Minimal Installation Exclusions</CardTitle>
                <CardDescription>
                  Files excluded from minimal installation type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {selectedFiles
                      .filter(file => file.excludeFromMinimal)
                      .length > 0 ? (
                      selectedFiles
                        .filter(file => file.excludeFromMinimal)
                        .map((file) => (
                          <div 
                            key={file.id} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <FileEdit className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.path}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleExcludeFromMinimal(file, false)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No files excluded from minimal installation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Dependencies Tab */}
        <TabsContent value="dependency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Dependencies</CardTitle>
              <CardDescription>
                Manage dependencies between files in your installer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Files with Dependencies</h4>
                  <ScrollArea className="h-[200px] border rounded-md">
                    <div className="p-2 space-y-1">
                      {selectedFiles
                        .filter(file => file.dependencies && file.dependencies.length > 0)
                        .length > 0 ? (
                        selectedFiles
                          .filter(file => file.dependencies && file.dependencies.length > 0)
                          .map((file) => (
                            <div 
                              key={file.id} 
                              className={`
                                flex items-center justify-between p-2 border rounded-md 
                                hover:bg-muted/50 cursor-pointer
                                ${selectedFile?.id === file.id ? 'border-primary bg-primary/5' : ''}
                              `}
                              onClick={() => setSelectedFile(file)}
                            >
                              <div className="flex items-center space-x-2">
                                <Link className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{file.name}</span>
                              </div>
                              <Badge>
                                {file.dependencies?.length} deps
                              </Badge>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No files with dependencies</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Files with Version Info</h4>
                  <ScrollArea className="h-[200px] border rounded-md">
                    <div className="p-2 space-y-1">
                      {selectedFiles
                        .filter(file => file.version)
                        .length > 0 ? (
                        selectedFiles
                          .filter(file => file.version)
                          .map((file) => (
                            <div 
                              key={file.id} 
                              className={`
                                flex items-center justify-between p-2 border rounded-md 
                                hover:bg-muted/50 cursor-pointer
                                ${selectedFile?.id === file.id ? 'border-primary bg-primary/5' : ''}
                              `}
                              onClick={() => setSelectedFile(file)}
                            >
                              <div className="flex items-center space-x-2">
                                <FileEdit className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{file.name}</span>
                              </div>
                              <Badge variant="outline">
                                v{file.version}
                              </Badge>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No files with version information</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Auto-Detect Dependencies</h4>
                <Button variant="outline" className="w-full">
                  Scan for Dependencies
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically detect dependencies between your files based on content analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedFile && (
        <div className="mt-4">
          <FileDetailView file={selectedFile} />
        </div>
      )}
    </div>
  );
}