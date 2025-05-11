import { useInstaller } from '@/context/InstallerContext';
import { formatFileSize, calculateTotalSize } from '@/lib/builderService';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package,
  Settings,
  FileText,
  Folder,
  Info,
  HardDrive,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface InstallerPreviewProps {
  miniMode?: boolean;
}

export function InstallerPreview({ miniMode = false }: InstallerPreviewProps) {
  const { currentProject, selectedFiles } = useInstaller();
  const totalSize = calculateTotalSize(selectedFiles);

  // Default values for preview
  const appName = currentProject?.name || 'My Application';
  const appVersion = currentProject?.version || '1.0.0';
  const publisher = currentProject?.publisher || 'Your Company';
  const installPath = currentProject?.defaultInstallPath || 'C:\\Program Files\\MyApp';
  const allowCustomPath = currentProject?.allowCustomInstallPath ?? true;
  const fileCount = selectedFiles.length;

  // If no project is defined, show a placeholder
  if (!currentProject && !miniMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <CardTitle>No Installer Configured</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Complete the installer settings and add files to preview your installer.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mini preview mode for sidebar
  if (miniMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Application:</span>
          <span className="font-medium">{appName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Version:</span>
          <span>{appVersion}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Publisher:</span>
          <span>{publisher}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Size:</span>
          <span>{formatFileSize(totalSize)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Files:</span>
          <span>{fileCount} item{fileCount !== 1 ? 's' : ''}</span>
        </div>
        <Separator />
        <div className="text-xs text-muted-foreground">
          <p>This is a simplified preview. Toggle to full preview mode to see the complete installer experience.</p>
        </div>
      </div>
    );
  }

  // Full preview mode
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 gap-8">
        {/* Welcome Screen */}
        <Card>
          <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex justify-center mb-4">
              <Package className="h-16 w-16" />
            </div>
            <CardTitle className="text-3xl">{appName} Setup</CardTitle>
            <p className="text-sm opacity-80">Version {appVersion}</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>Welcome to the {appName} Setup Wizard</p>
              <p>This will install {appName} {appVersion} on your computer.</p>
              <p className="text-sm text-muted-foreground">
                Click Next to continue or Cancel to exit the setup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* License Agreement Screen */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">License Agreement</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>Please review the license terms before installing {appName}.</p>
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-sm">
                  <ScrollArea className="h-32">
                    <p>Sample license agreement text would appear here.</p>
                    <p className="mt-2">
                      This is a placeholder for the actual license agreement that would be included with your software installer.
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">I accept the agreement</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Directory Screen */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Installation Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>Choose the folder in which to install {appName}.</p>
              
              <div className="flex items-center space-x-2 p-2 border rounded-md">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm">{installPath}</span>
                <div className="bg-primary/10 text-primary p-1 rounded">
                  <Folder className="h-4 w-4" />
                </div>
              </div>
              
              {allowCustomPath ? (
                <p className="text-sm text-muted-foreground">
                  Click Browse to install in a different folder.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This application must be installed in the specified folder.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ready to Install Screen */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Ready to Install</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>Setup is ready to begin installing {appName} on your computer.</p>
              
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Application:</span>
                  <span className="text-sm font-medium">{appName} {appVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Publisher:</span>
                  <span className="text-sm">{publisher}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Install location:</span>
                  <span className="text-sm">{installPath}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Required space:</span>
                  <span className="text-sm">{formatFileSize(totalSize)}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Click Install to continue or Back to review or change settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installing Screen */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Installing</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>Please wait while {appName} is being installed...</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extracting files...</span>
                  <span>68%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '68%' }}></div>
                </div>
              </div>
              
              <div className="h-32 overflow-y-auto border rounded-md p-2 text-xs font-mono text-muted-foreground">
                {selectedFiles.slice(0, 8).map((file, index) => (
                  <div key={index} className="py-0.5">
                    <Clock className="h-3 w-3 inline mr-1" /> Extracting: {file.path}
                  </div>
                ))}
                {selectedFiles.length > 8 && (
                  <div className="py-0.5">... and {selectedFiles.length - 8} more files</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Screen */}
        <Card>
          <CardHeader className="text-center bg-primary/10 rounded-t-lg">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-xl">Installation Complete</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <p>{appName} {appVersion} has been successfully installed on your computer.</p>
              <div className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">Launch {appName}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Click Finish to exit the setup wizard.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>This is a preview of how your installer will appear to users.</p>
        </div>
      </div>
    </div>
  );
}
