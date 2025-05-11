import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the installer project schema
export const installerProjects = pgTable("installer_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  publisher: text("publisher").notNull(),
  description: text("description"),
  defaultInstallPath: text("default_install_path").notNull(),
  allowCustomInstallPath: boolean("allow_custom_install_path").default(true),
  compressionLevel: integer("compression_level").default(6),
  files: jsonb("files").notNull().default([]),
  created: text("created").notNull(), // Store date as ISO string
  
  // New fields for enhanced installer features
  iconPath: text("icon_path"), // Custom installer icon
  splashScreenPath: text("splash_screen_path"), // Custom splash screen
  installationType: text("installation_type").default("full"), // Full, Minimal, Custom
  licenseAgreement: text("license_agreement"), // License text
  requiresElevatedPermissions: boolean("requires_elevated_permissions").default(false),
  minOSVersion: text("min_os_version"), // Minimum OS version required
  targetPlatforms: jsonb("target_platforms").default(["windows", "macos", "linux"]),
  languages: jsonb("languages").default(["en"]), // Supported languages
  supportURL: text("support_url"), // Support URL
  updateURL: text("update_url"), // URL for checking updates
  hasAutoUpdate: boolean("has_auto_update").default(false), // Whether auto-update is enabled
  installationSteps: jsonb("installation_steps").default([]), // Custom installation steps
  
  // Security features
  digitalSignature: text("digital_signature"), // Digital signature for verification
  encryptionEnabled: boolean("encryption_enabled").default(false), // Whether files are encrypted
  encryptionKey: text("encryption_key"), // Encryption key (if needed)
  
  // Advanced installation options
  allowSilentInstall: boolean("allow_silent_install").default(false), // Silent installation
  createDesktopShortcut: boolean("create_desktop_shortcut").default(true), // Create desktop shortcut
  createStartMenuEntry: boolean("create_start_menu_entry").default(true), // Create start menu entry
  registerFileAssociations: jsonb("register_file_associations").default([]), // File associations
  
  // User experience options
  collectUserInfo: boolean("collect_user_info").default(false), // Collect user registration
  userInfoFields: jsonb("user_info_fields").default([]), // User info fields to collect
  showProgressBar: boolean("show_progress_bar").default(true), // Show progress during installation
  allowCancel: boolean("allow_cancel").default(true), // Allow cancel during installation
  
  // Custom theme
  themeColor: text("theme_color").default("#1E90FF"), // Primary theme color
  darkMode: boolean("dark_mode").default(false), // Dark mode for installer
  
  // Project metadata
  lastEdited: text("last_edited"), // Last edited timestamp
  tags: jsonb("tags").default([]), // Project tags for organization
});

// Create the insert schema for installer projects
export const insertInstallerProjectSchema = createInsertSchema(installerProjects).omit({
  id: true,
});

// Extended schema with validation
export const installerProjectFormSchema = insertInstallerProjectSchema.extend({
  name: z.string().min(1, "Name is required"),
  version: z.string().min(1, "Version is required"),
  publisher: z.string().min(1, "Publisher is required"),
  defaultInstallPath: z.string().min(1, "Default installation path is required"),
  
  // Additional validations for new fields
  supportURL: z.string().url("Must be a valid URL").optional().nullable(),
  updateURL: z.string().url("Must be a valid URL").optional().nullable(),
  iconPath: z.string().optional().nullable(),
  splashScreenPath: z.string().optional().nullable(),
  licenseAgreement: z.string().optional().nullable(),
  minOSVersion: z.string().optional().nullable(),
  digitalSignature: z.string().optional().nullable(),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").optional().nullable(),
  
  // Array validations
  targetPlatforms: z.array(z.enum(["windows", "macos", "linux"])).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  registerFileAssociations: z.array(z.object({
    extension: z.string(),
    description: z.string(),
    iconPath: z.string().optional()
  })).optional().nullable(),
  userInfoFields: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["text", "email", "checkbox", "number"]),
    required: z.boolean().default(false)
  })).optional().nullable(),
  installationSteps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    optional: z.boolean().default(false),
    type: z.enum(["standard", "license", "custom", "options"]),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      default: z.boolean().default(false)
    })).optional()
  })).optional().nullable(),
});

// Define the file schema for use in the files array
export const fileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  size: z.number(),
  type: z.string(),
  isDirectory: z.boolean().optional(),
  children: z.array(z.lazy(() => fileSchema)).optional(),
  // New properties for enhanced file handling
  excluded: z.boolean().optional(), // For file exclusion patterns
  version: z.string().optional(), // For file versioning
  dependencies: z.array(z.string()).optional(), // List of file dependencies 
  category: z.string().optional(), // For file categorization
  encrypted: z.boolean().optional(), // For file encryption
  encryptionKey: z.string().optional(), // Encryption key for this specific file
  excludeFromMinimal: z.boolean().optional(), // Exclude from minimal installation
});

// Define the compression levels
export const compressionLevels = [
  { value: 0, label: "No Compression" },
  { value: 1, label: "Minimal" },
  { value: 3, label: "Low" },
  { value: 6, label: "Default" },
  { value: 9, label: "Maximum" },
];

// Installation types
export const installationTypes = [
  { value: "full", label: "Full Installation" },
  { value: "minimal", label: "Minimal Installation" },
  { value: "custom", label: "Custom Installation" },
];

// Supported OS list
export const supportedOperatingSystems = [
  { value: "windows", label: "Windows", versions: ["7", "8", "10", "11"] },
  { value: "macos", label: "macOS", versions: ["10.13", "10.14", "10.15", "11", "12", "13"] },
  { value: "linux", label: "Linux", versions: ["Ubuntu 20.04+", "Debian 10+", "CentOS 7+", "Fedora 33+"] }
];

// Supported languages
export const supportedLanguages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ru", label: "Russian" },
  { value: "pt", label: "Portuguese" },
];

// Export types
export type InsertInstallerProject = z.infer<typeof insertInstallerProjectSchema>;
export type InstallerProject = typeof installerProjects.$inferSelect;
export type FileItem = z.infer<typeof fileSchema>;
