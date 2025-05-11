import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useInstaller } from '@/context/InstallerContext';
import { calculateTotalSize, estimateCompressedSize, formatFileSize } from '@/lib/builderService';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  compressionLevels, 
  InstallerProject,
  installerProjectFormSchema
} from '@shared/schema';

interface CompressionSettingsProps {
  onSave: () => Promise<void>;
}

export function CompressionSettings({ onSave }: CompressionSettingsProps) {
  const { currentProject, setCurrentProject, selectedFiles } = useInstaller();
  
  // Initialize form with compression settings
  const form = useForm<Pick<InstallerProject, 'compressionLevel'>>({
    resolver: zodResolver(installerProjectFormSchema.pick({ compressionLevel: true })),
    defaultValues: {
      compressionLevel: currentProject?.compressionLevel || 6,
    },
  });

  // Update form when project changes
  useEffect(() => {
    if (currentProject) {
      form.reset({
        compressionLevel: currentProject.compressionLevel,
      });
    }
  }, [currentProject, form]);

  // Calculate file sizes for display
  const totalSize = calculateTotalSize(selectedFiles);
  const compressionLevel = form.watch('compressionLevel');
  const estimatedSize = estimateCompressedSize(totalSize, compressionLevel);
  const savingsPercentage = totalSize > 0 
    ? Math.round(((totalSize - estimatedSize) / totalSize) * 100) 
    : 0;

  // Handle form submission
  const onSubmit = async (data: Pick<InstallerProject, 'compressionLevel'>) => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        compressionLevel: data.compressionLevel,
      });
      await onSave();
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-lg font-medium">Compression Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure compression options for your installer package
        </p>
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="compressionLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compression Level</FormLabel>
                <div className="space-y-4">
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select compression level" />
                    </SelectTrigger>
                    <SelectContent>
                      {compressionLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label} ({level.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={0}
                      max={9}
                      step={1}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="py-4"
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Higher compression levels result in smaller installer size but may take longer to create and extract
                </FormDescription>
              </FormItem>
            )}
          />
          
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium">Compression Preview</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Original Size:</p>
                <p className="font-medium">{formatFileSize(totalSize)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Size:</p>
                <p className="font-medium">{formatFileSize(estimatedSize)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Space Saved</span>
                <span>{savingsPercentage}%</span>
              </div>
              <Progress value={savingsPercentage} />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Actual compression results may vary depending on file types and content.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">
              Save Compression Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
