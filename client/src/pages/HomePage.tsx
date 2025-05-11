import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, ArrowRight } from "lucide-react";
import { InstallerProject } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function HomePage() {
  // Fetch all installer projects
  const { data: projects, isLoading, error } = useQuery<InstallerProject[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Hero section */}
        <section className="text-center py-16 px-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/20">
          <h1 className="text-4xl font-bold mb-4">Installer Builder</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create customizable, self-compressing installers with an intuitive drag-and-drop interface
          </p>
          <Link href="/builder">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              <span>Create New Installer</span>
            </Button>
          </Link>
        </section>

        {/* Recent projects section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Link href="/builder">
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-5 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-8 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="bg-destructive/10 text-destructive border-destructive/50">
              <CardHeader>
                <CardTitle>Error loading projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Unable to load your projects. Please try again later.</p>
              </CardContent>
            </Card>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      v{project.version} • {project.publisher}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {project.description || "No description provided"}
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(project.created), { addSuffix: true })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/builder/${project.id}`}>
                      <Button variant="outline" className="w-full gap-1">
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No projects yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You haven't created any installer projects yet. Get started by creating your first project.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/builder">
                  <Button className="w-full gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Installer</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </section>

        {/* Features section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Drag & Drop Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily add files and folders to your installer package with a simple drag and drop interface.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V16M8 12H16M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <CardTitle>Self-Compression</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically compress your installer package to reduce size while maintaining performance.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9H18M6 15H18M12 9V15M2 12C2 8.229 2 6.343 3.172 5.172C4.343 4 6.229 4 10 4H14C17.771 4 19.657 4 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.657 20 17.771 20 14 20H10C6.229 20 4.343 20 3.172 18.828C2 17.657 2 15.771 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <CardTitle>Customization Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Personalize your installer with branding, custom installation paths, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
