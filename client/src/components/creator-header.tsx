import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings, Edit3, BarChart3, Users } from "lucide-react";
import type { Game } from "@shared/firebase-types";

export function CreatorHeader() {
  const [location, setLocation] = useLocation();
  const [creatorKeys, setCreatorKeys] = useState<string[]>([]);

  // Get all creator keys from localStorage
  useEffect(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('creatorKey_')) {
        const creatorKey = localStorage.getItem(key);
        if (creatorKey) {
          keys.push(creatorKey);
        }
      }
    }
    setCreatorKeys(keys);
  }, [location]);

  // Fetch games for all creator keys
  const { data: allGames = [] } = useQuery<Game[]>({
    queryKey: ['/api/creator/games', creatorKeys],
    queryFn: async () => {
      const allGamesData: Game[] = [];
      
      for (const creatorKey of creatorKeys) {
        try {
          const response = await fetch('/api/creator/games', {
            headers: {
              'X-Creator-Key': creatorKey,
            },
          });
          
          if (response.ok) {
            const games = await response.json();
            allGamesData.push(...games);
          }
        } catch (error) {
          console.error('Failed to fetch games for creator key:', error);
        }
      }
      
      // Remove duplicates and sort by creation date
      const uniqueGames = allGamesData.filter((game, index, self) => 
        index === self.findIndex(g => g.id === game.id)
      );
      
      return uniqueGames.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: creatorKeys.length > 0,
  });

  // Don't show header if no creator keys found
  if (creatorKeys.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Creator Dashboard</span>
          {allGames.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                  My Games ({allGames.length})
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {allGames.map((game) => (
                  <div key={game.id}>
                    <div className="px-3 py-2">
                      <div className="font-medium text-sm">{game.companyName}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {game.industry} • Created {new Date(game.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setLocation(`/edit-questions/${game.id}`)}
                          data-testid={`button-edit-questions-${game.id}`}
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          Edit Questions
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setLocation(`/leaderboard/${game.id}`)}
                          data-testid={`button-leaderboard-${game.id}`}
                        >
                          <BarChart3 className="mr-1 h-3 w-3" />
                          Leaderboard
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setLocation(`/submissions/${game.id}`)}
                          data-testid={`button-submissions-${game.id}`}
                        >
                          <Users className="mr-1 h-3 w-3" />
                          Submissions
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </div>
                ))}
                <DropdownMenuItem onClick={() => setLocation('/setup')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Create New Game
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="text-xs text-primary-foreground/80">
          {allGames.length > 0 ? `Managing ${allGames.length} game${allGames.length !== 1 ? 's' : ''}` : 'No games created yet'}
        </div>
      </div>
    </div>
  );
}