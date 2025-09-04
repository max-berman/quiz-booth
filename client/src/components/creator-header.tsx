import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Settings, BarChart3, LogOut, User } from "lucide-react";
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

  // Don't show header if no creator keys found
  if (!hasCreatorKeys) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </div>
  );
}
