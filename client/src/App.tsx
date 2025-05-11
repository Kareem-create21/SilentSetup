import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import BuilderPage from "@/pages/BuilderPage";
import { NavigationBar } from "@/components/NavigationBar";
import { InstallerProvider } from "@/context/InstallerContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/builder" component={BuilderPage} />
      <Route path="/builder/:id" component={BuilderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <InstallerProvider>
            <div className="min-h-screen flex flex-col">
              <NavigationBar />
              <div className="flex-1">
                <Router />
              </div>
            </div>
            <Toaster />
          </InstallerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
