# Installer Builder

![Installer Builder](generated-icon.png)

A powerful desktop application for creating customizable, self-compressing installers with an intuitive drag-and-drop interface. 

## Features

Installer Builder lets you package your software into professional, cross-platform installers with these powerful features:

### Installer Configuration
- **Custom installer appearance** - Add custom icons and splash screens
- **Multiple installation types** - Full, minimal, and custom installation options
- **License agreement integration** - Include licenses that users must accept
- **System requirements checking** - Verify OS version and hardware requirements
- **Installation size prediction** - Accurate size estimation before download
- **Digital signature verification** - Ensure installer authenticity
- **User registration** - Collect user information during installation
- **Multi-language support** - Create installers in multiple languages
- **Custom installation steps** - Design your own installation workflow

### File Management
- **Advanced file handling** - Organize, categorize, and customize files
- **File exclusion patterns** - Use regex patterns to exclude unwanted files
- **File version control** - Track file versions within your installer
- **Dependency tracking** - Automatically detect and manage file dependencies
- **File categorization** - Organize files into logical categories
- **Powerful search** - Find files quickly within your installer package
- **Compression settings** - Choose from multiple compression levels
- **File encryption** - Protect sensitive files with encryption
- **Remote file import** - Import files directly from URLs

### User Experience
- **Installation preview** - Simulate the installation process before building
- **Dark mode support** - Choose between light and dark themes
- **Keyboard shortcuts** - Work efficiently with custom shortcuts
- **Project templates** - Start new projects from templates
- **Recent projects list** - Quickly access your recent work
- **Project import/export** - Share project configurations
- **Auto-save** - Never lose your work with automatic saving

### Deployment
- **Multi-platform support** - Create installers for Windows, macOS, and Linux
- **Auto-update mechanism** - Build in update checks for your software
- **Silent installation** - Support for unattended installations
- **Command-line options** - Powerful CLI for automation
- **Network installation** - Deploy across networks efficiently

## Getting Started

### Installation

1. Download the latest version from the [releases page](https://github.com/installer-builder/releases)
2. Run the installer for your platform (Windows, macOS, or Linux)
3. Follow the installation wizard to complete setup

### Quick Start

1. Launch Installer Builder
2. Click "New Installer" to create a new project
3. Enter basic information (name, version, publisher)
4. Drag and drop files or folders into the file area
5. Configure installation options in the settings tabs
6. Click "Build Installer" to generate your installer
7. Your installer will be saved to the specified location

## Creating Your First Installer

### 1. Project Setup

Start by creating a new project and filling in the basic information:
- **Name**: Your application name
- **Version**: Your application version (e.g., 1.0.0)
- **Publisher**: Your company or name
- **Description**: A brief description of your application

### 2. Adding Files

There are multiple ways to add files to your installer:
- Drag and drop files or folders directly into the application
- Use the "Add Files" button to browse for files
- Use the "Add Folder" button to add entire directories
- Import from a URL by entering a valid file URL

### 3. Configuring Options

Use the tabs in the settings panel to configure your installer:
- **General**: Basic installer settings
- **Files**: Manage and organize your files
- **Appearance**: Customize the look and feel
- **Advanced**: Configure installation behavior
- **Security**: Set up encryption and digital signing

### 4. Building Your Installer

When you're ready to build your installer:
1. Click the "Build Installer" button
2. Select the target platforms (Windows, macOS, Linux)
3. Choose the output location
4. Wait for the build process to complete
5. Test your installer on target platforms

## Advanced Features

### Custom Installation Steps

Create a custom installation workflow:
1. Go to the "Advanced" tab
2. Click "Custom Installation Steps"
3. Add, remove, or rearrange steps
4. Configure each step with custom content and options

### File Dependencies

Manage dependencies between files:
1. Select a file in the file list
2. Go to the "Dependencies" tab
3. Add files that this file depends on
4. The installer will ensure dependencies are installed first

### Silent Installation

Configure silent installation options:
1. Go to the "Advanced" tab
2. Enable "Allow Silent Installation"
3. Configure command-line parameters
4. Document these for your users

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Project | Ctrl+N | Cmd+N |
| Open Project | Ctrl+O | Cmd+O |
| Save Project | Ctrl+S | Cmd+S |
| Build Installer | Ctrl+B | Cmd+B |
| Add Files | Ctrl+F | Cmd+F |
| Add Folder | Ctrl+D | Cmd+D |
| Delete Selected | Delete | Delete |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y | Cmd+Y |
| Search | Ctrl+F | Cmd+F |
| Toggle Dark Mode | Ctrl+Shift+D | Cmd+Shift+D |

## System Requirements

### Windows
- Windows 10 or later
- 4 GB RAM minimum
- 500 MB disk space
- .NET Framework 4.7.2 or later

### macOS
- macOS 10.13 (High Sierra) or later
- 4 GB RAM minimum
- 500 MB disk space

### Linux
- Ubuntu 20.04, Debian 10, or other modern distributions
- 4 GB RAM minimum
- 500 MB disk space
- GTK 3.0 or later

## License

This software is licensed under the [MIT License](LICENSE.md).

## Support

For support, please visit our [support portal](https://installer-builder.com/support) or email [support@installer-builder.com](mailto:support@installer-builder.com).

## Contributing

We welcome contributions to Installer Builder! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Acknowledgements

- [Electron](https://www.electronjs.org/) - Framework for building cross-platform desktop applications
- [React](https://reactjs.org/) - User interface library
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- All our beta testers and contributors