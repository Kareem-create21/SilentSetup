import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useInstaller } from '@/context/InstallerContext';
import { generateDefaultInstallPath } from '@/lib/builderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  InstallerProject, 
  insertInstallerProjectSchema,
  installerProjectFormSchema
} from '@shared/schema';

interface InstallerSettingsProps {
  isLoading?: boolean;
  onSave: () => Promise<void>;
}

export function InstallerSettings({ isLoading = false, onSave }: InstallerSettingsProps) {
  const { toast } = useToast();
  const { currentProject, setCurrentProject } = useInstaller();
  
  // Initialize form with project data or defaults
  const form = useForm<InstallerProject>({
    resolver: zodResolver(installerProjectFormSchema),
    defaultValues: {
      name: currentProject?.name || '',
      version: currentProject?.version || '1.0.0',
      publisher: currentProject?.publisher || '',
      description: currentProject?.description || '',
      defaultInstallPath: currentProject?.defaultInstallPath || 'C:\\Program Files\\MyApp',
      allowCustomInstallPath: currentProject?.allowCustomInstallPath ?? true,
      compressionLevel: currentProject?.compressionLevel || 6,
      files: currentProject?.files || [],
      id: currentProject?.id || 0,
      created: currentProject?.created || new Date().toISOString(),
    },
  });

  // Update form when project changes
  useEffect(() => {
    if (currentProject) {
      form.reset({
        ...currentProject,
        // Ensure the values are set correctly
        allowCustomInstallPath: currentProject.allowCustomInstallPath ?? true,
      });
    }
  }, [currentProject, form]);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: Omit<InstallerProject, 'id'>) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: (data: InstallerProject) => {
      setCurrentProject(data);
      toast({
        title: 'Project Created',
        description: 'Your new installer project has been created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Project',
        description: error.message || 'There was an error creating your project.',
        variant: 'destructive',
      });
    },
  });

  // Generate default install path when name changes
  useEffect(() => {
    const name = form.watch('name');
    if (name && !currentProject?.defaultInstallPath) {
      generateDefaultInstallPath(name).then((path) => {
        form.setValue('defaultInstallPath', path);
      });
    }
  }, [form.watch('name'), currentProject?.defaultInstallPath, form]);

  // Handle form submission
  const onSubmit = async (data: InstallerProject) => {
    if (!currentProject?.id) {
      // Create new project
      await createProjectMutation.mutateAsync(data);
    } else {
      // Existing project will be updated by the parent component
      setCurrentProject({
        ...currentProject,
        ...data,
      });
      await onSave();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-lg font-medium">Installer Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure the basic settings for your installer
        </p>
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Application" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your application
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    The version of your application
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher</FormLabel>
                <FormControl>
                  <Input placeholder="Your Company Name" {...field} />
                </FormControl>
                <FormDescription>
                  The name of the publisher or company
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="A short description of your application"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of your application (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-md font-medium">Installation Options</h3>
            
            <FormField
              control={form.control}
              name="defaultInstallPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Installation Path</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The default location where your application will be installed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="allowCustomInstallPath"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Custom Install Location</FormLabel>
                    <FormDescription>
                      Let users choose their own installation directory
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
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
