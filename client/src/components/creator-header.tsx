import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, LogOut, User, Home, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CreatorHeader() {
  const [location, setLocation] = useLocation();
  const [hasCreatorKeys, setHasCreatorKeys] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const isHomePage = location === '/';

  // Check if user has any creator keys
  useEffect(() => {
    let foundKeys = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("game-") && key?.endsWith("-creator-key")) {
        foundKeys = true;
        break;
      }
    }
    setHasCreatorKeys(foundKeys);
  }, [location]);

  // Show header if: authenticated, has creator keys, or not on home page (for navigation)
  const shouldShowHeader = isAuthenticated || hasCreatorKeys || !isHomePage;
  
  if (!shouldShowHeader) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Show Home button when not on home page */}
          {!isHomePage && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setLocation("/")}
              data-testid="button-home"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          )}
          
          {/* Show creator tools if user has access */}
          {(isAuthenticated || hasCreatorKeys) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-dashboard"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setLocation("/setup")}
                data-testid="button-create-game"
              >
                <Settings className="mr-2 h-4 w-4" />
                Create Game
              </Button>
            </>
          )}
        </div>
        
        {/* Authentication section */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            // Authenticated user dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  data-testid="user-menu"
                >
                  <User className="mr-2 h-4 w-4" />
                  {user?.email?.split('@')[0] || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLocation('/dashboard')}
                  className="cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Sign in button for non-authenticated users
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setLocation("/auth/sign-in")}
              data-testid="button-sign-in"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}