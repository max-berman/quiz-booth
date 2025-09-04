import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { getAuthHeaders } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  BarChart3, 
  Users, 
  Calendar, 
  Building, 
  Plus,
  ArrowLeft,
  Database,
  Share2
} from "lucide-react";
import { QRCodeModal } from "@/components/qr-code-modal";
import { ShareEmbedModal } from "@/components/share-embed-modal";
import type { Game } from "@shared/firebase-types";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [creatorKeys, setCreatorKeys] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Get all creator keys from localStorage
  useEffect(() => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('game-') && key?.endsWith('-creator-key')) {
        const creatorKey = localStorage.getItem(key);
        if (creatorKey) {
          keys.push(creatorKey);
        }
      }
    }
    setCreatorKeys(keys);
  }, []);

  // Fetch games using new authentication system
  const { data: allGames = [], isLoading } = useQuery<Game[]>({
    queryKey: ['/api/my-games', user?.uid, creatorKeys],
    queryFn: async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/my-games', { headers });
        
        if (response.ok) {
          const games = await response.json();
          return games.sort((a: Game, b: Game) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          console.error('Failed to fetch games:', response.statusText);
          return [];
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        return [];
      }
    },
    enabled: isAuthenticated || creatorKeys.length > 0,
  });

  if (creatorKeys.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Games Created</h2>
              <p className="text-muted-foreground mb-6">
                You haven't created any trivia games yet. Get started by creating your first game!
              </p>
              <Button onClick={() => setLocation('/setup')} data-testid="button-create-first-game">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-h1 text-foreground">Creator Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your {allGames.length} trivia game{allGames.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setLocation('/setup')} 
            data-testid="button-create-new-game"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Game
          </Button>
        </div>

        {/* Games Grid */}
        {allGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGames.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {game.companyName}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2">
                      {game.industry}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Game Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created {new Date(game.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {game.questionCount} questions • {game.difficulty} difficulty
                    </div>
                    {game.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {game.categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setLocation(`/edit-questions/${game.id}`)}
                      className="w-full"
                      data-testid={`button-edit-questions-${game.id}`}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Questions
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/leaderboard/${game.id}`)}
                        data-testid={`button-leaderboard-${game.id}`}
                      >
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Leaderboard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/submissions/${game.id}`)}
                        data-testid={`button-submissions-${game.id}`}
                      >
                        <Database className="mr-1 h-4 w-4" />
                        Raw Data
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <QRCodeModal gameId={game.id} gameTitle={game.companyName} />
                      <ShareEmbedModal gameId={game.id} gameTitle={game.companyName} />
                    </div>
                  </div>

                  {/* Prizes if configured */}
                  {(game.firstPrize || game.secondPrize || game.thirdPrize) && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Prizes:</p>
                      <div className="text-xs space-y-1">
                        {game.firstPrize && <div>🥇 {game.firstPrize}</div>}
                        {game.secondPrize && <div>🥈 {game.secondPrize}</div>}
                        {game.thirdPrize && <div>🥉 {game.thirdPrize}</div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Games Found</h2>
              <p className="text-muted-foreground mb-6">
                There was an issue loading your games. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}