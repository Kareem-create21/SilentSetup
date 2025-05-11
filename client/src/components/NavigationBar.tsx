import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Package, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function NavigationBar() {
  const [location] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Installer Builder</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <div className={`flex items-center space-x-1 px-3 py-2 rounded-md transition cursor-pointer ${
                location === "/" ? "text-primary bg-primary/10" : "hover:bg-muted"
              }`}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </div>
            </Link>
            <Link href="/builder">
              <div className={`flex items-center space-x-1 px-3 py-2 rounded-md transition cursor-pointer ${
                location.startsWith("/builder") ? "text-primary bg-primary/10" : "hover:bg-muted"
              }`}>
                <Package className="h-4 w-4" />
                <span>Builder</span>
              </div>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Link href="/builder">
            <Button variant="default" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Installer</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
