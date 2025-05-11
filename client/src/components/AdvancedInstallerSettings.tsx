import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Info, Languages, PaintBucket, Upload, Settings, Shield, MonitorSmartphone } from 'lucide-react';
import { InstallerProject, installationTypes, supportedOperatingSystems, supportedLanguages } from '@shared/schema';
import { useInstaller } from '@/context/InstallerContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdvancedInstallerSettingsProps {
  project: InstallerProject;
  onUpdate: (values: Partial<InstallerProject>) => void;
  isLoading?: boolean;
}

export function AdvancedInstallerSettings({ project, onUpdate, isLoading = false }: AdvancedInstallerSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const splashInputRef = useState<HTMLInputElement | null>(null);
  
  // Create form with default values from project
  const form = useForm<Partial<InstallerProject>>({
    defaultValues: {
      // General
      installationType: project.installationType || 'full',
      requiresElevatedPermissions: project.requiresElevatedPermissions || false,
      targetPlatforms: project.targetPlatforms as string[] || ['windows', 'macos', 'linux'],
      minOSVersion: project.minOSVersion || '',
      
      // User Interface
      iconPath: project.iconPath || '',
      splashScreenPath: project.splashScreenPath || '',
      themeColor: project.themeColor || '#1E90FF',
      darkMode: project.darkMode || false,
      languages: project.languages as string[] || ['en'],
      
      // Advanced Options
      allowSilentInstall: project.allowSilentInstall || false,
      createDesktopShortcut: project.createDesktopShortcut ?? true,
      createStartMenuEntry: project.createStartMenuEntry ?? true,
      collectUserInfo: project.collectUserInfo || false,
      showProgressBar: project.showProgressBar ?? true,
      allowCancel: project.allowCancel ?? true,
      
      // Additional Information
      licenseAgreement: project.licenseAgreement || '',
      supportURL: project.supportURL || '',
      updateURL: project.updateURL || '',
      hasAutoUpdate: project.hasAutoUpdate || false,
      
      // Security
      encryptionEnabled: project.encryptionEnabled || false,
      digitalSignature: project.digitalSignature || '',
    },
  });
  
  // Handle form submission
  const handleSubmit = (values: Partial<InstallerProject>) => {
    onUpdate(values);
  };
  
  // Handle icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // In a real implementation, we would upload the icon and get a URL
      // For now, just use the file name
      form.setValue('iconPath', file.name);
    }
  };
  
  // Handle splash screen upload
  const handleSplashUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // In a real implementation, we would upload the splash screen and get a URL
      // For now, just use the file name
      form.setValue('splashScreenPath', file.name);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="ui">
              <PaintBucket className="h-4 w-4 mr-2" />
              User Interface
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <MonitorSmartphone className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          
          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select installation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {installationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose between full, minimal, or custom installation options.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requiresElevatedPermissions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Elevated Permissions</FormLabel>
                      <FormDescription>
                        Require administrator or root privileges for installation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="targetPlatforms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Platforms</FormLabel>
                  <div className="space-y-2">
                    {supportedOperatingSystems.map((os) => (
                      <div key={os.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`os-${os.value}`}
                          checked={(field.value || []).includes(os.value)}
                          onChange={(e) => {
                            const currentValues = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...currentValues, os.value]);
                            } else {
                              field.onChange(currentValues.filter(v => v !== os.value));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`os-${os.value}`} className="text-sm font-medium">
                          {os.label}
                        </label>
                        <div className="flex flex-wrap gap-1 ml-2">
                          {os.versions.map((version) => (
                            <Badge key={`${os.value}-${version}`} variant="outline" className="text-xs">
                              {version}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Select the operating systems your installer will support.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="minOSVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum OS Version</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Windows 10, macOS 10.15" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the minimum OS version required for your application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* User Interface Tab */}
          <TabsContent value="ui" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Custom Installer Icon</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleIconUpload}
                    ref={(input) => (fileInputRef[1] = input)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef[1]?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Icon
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {form.watch('iconPath') || 'No icon selected'}
                  </span>
                </div>
                <FormDescription>
                  Upload a custom icon for your installer (.ico, .png, .jpg).
                </FormDescription>
              </FormItem>
              
              <FormItem>
                <FormLabel>Splash Screen</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleSplashUpload}
                    ref={(input) => (splashInputRef[1] = input)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => splashInputRef[1]?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {form.watch('splashScreenPath') || 'No image selected'}
                  </span>
                </div>
                <FormDescription>
                  Upload a splash screen image displayed during installation.
                </FormDescription>
              </FormItem>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="themeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                    </div>
                    <FormDescription>
                      Choose the primary color for your installer theme.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Dark Mode</FormLabel>
                      <FormDescription>
                        Enable dark mode for your installer interface
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supported Languages</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {supportedLanguages.map((language) => (
                      <Badge
                        key={language.value}
                        variant={(field.value || []).includes(language.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const currentValues = field.value || [];
                          if (currentValues.includes(language.value)) {
                            field.onChange(currentValues.filter(v => v !== language.value));
                          } else {
                            field.onChange([...currentValues, language.value]);
                          }
                        }}
                      >
                        {language.label}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Select languages your installer will support.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="createDesktopShortcut"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Desktop Shortcut</FormLabel>
                      <FormDescription>
                        Create desktop shortcut during installation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="createStartMenuEntry"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Start Menu Entry</FormLabel>
                      <FormDescription>
                        Create start menu entry during installation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allowSilentInstall"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Silent Install</FormLabel>
                      <FormDescription>
                        Allow installation without user interaction
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowCancel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Cancel</FormLabel>
                      <FormDescription>
                        Allow users to cancel installation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="licenseAgreement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Agreement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your license agreement text here..."
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a license agreement that users must accept during installation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Auto-Update Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hasAutoUpdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Auto-Update</FormLabel>
                        <FormDescription>
                          Enable automatic updates for your application
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="updateURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/updates"
                          {...field}
                          disabled={!form.watch('hasAutoUpdate')}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to check for application updates.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="supportURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/support"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL for users to get support for your application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Features</AlertTitle>
              <AlertDescription>
                These security features help protect your installer and application from tampering.
              </AlertDescription>
            </Alert>
            
            <FormField
              control={form.control}
              name="encryptionEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>File Encryption</FormLabel>
                    <FormDescription>
                      Encrypt files to protect them from unauthorized access
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="digitalSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digital Signature</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your digital signature information..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a digital signature to verify the authenticity of your installer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="collectUserInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Collect User Information</FormLabel>
                    <FormDescription>
                      Collect user registration information during installation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch('collectUserInfo') && (
              <Card>
                <CardHeader>
                  <CardTitle>User Registration Fields</CardTitle>
                  <CardDescription>
                    Configure the information collected during installation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="field-name" className="h-4 w-4" checked />
                      <label htmlFor="field-name" className="text-sm font-medium">Name</label>
                      <Badge>Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="field-email" className="h-4 w-4" checked />
                      <label htmlFor="field-email" className="text-sm font-medium">Email</label>
                      <Badge>Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="field-organization" className="h-4 w-4" />
                      <label htmlFor="field-organization" className="text-sm font-medium">Organization</label>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Custom Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Advanced Settings'}
          </Button>
        </div>
      </form>
    </Form>
  );
}