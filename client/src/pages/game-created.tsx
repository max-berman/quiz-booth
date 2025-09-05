import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Play,
  Share2,
  BarChart3,
  Copy,
  QrCode,
  Edit3,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeModal } from "@/components/qr-code-modal";
import { ShareEmbedModal } from "@/components/share-embed-modal";
import type { Game } from "@shared/firebase-types";

export default function GameCreated() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: [`/api/games/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/games/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const gameUrl = `${window.location.origin}/game/${id}`;

  const copyGameUrl = () => {
    navigator.clipboard.writeText(gameUrl);
    toast({
      title: "Copied!",
      description: "Game URL copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <Button onClick={() => setLocation('/dashboard')}>
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Game Created Successfully!
          </h1>
          <p className="text-muted-foreground">
            Your trivia game is ready to engage visitors at your trade show.
          </p>
        </div>

        {/* Game Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{game.companyName}</CardTitle>
              <Badge variant="secondary">{game.industry}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{game.questionCount}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary capitalize">{game.difficulty}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{game.categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">${game.firstPrize || '0'}</div>
                <div className="text-sm text-muted-foreground">First Prize</div>
              </div>
            </div>

            {game.categories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Question Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {game.categories.map((category, index) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {game.productDescription && (
              <div>
                <h4 className="font-medium mb-2">Product Description:</h4>
                <p className="text-muted-foreground text-sm">{game.productDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={() => setLocation(`/game/${id}`)}
            className="h-24 flex flex-col gap-2"
            data-testid="button-play-game"
          >
            <Play className="h-6 w-6" />
            <span>Play Game</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setShowQR(true)}
            className="h-24 flex flex-col gap-2"
            data-testid="button-qr-code"
          >
            <QrCode className="h-6 w-6" />
            <span>QR Code</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setShowShare(true)}
            className="h-24 flex flex-col gap-2"
            data-testid="button-share-embed"
          >
            <Share2 className="h-6 w-6" />
            <span>Share & Embed</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="h-24 flex flex-col gap-2"
            data-testid="button-dashboard"
          >
            <BarChart3 className="h-6 w-6" />
            <span>Dashboard</span>
          </Button>
        </div>

        {/* Quick Share Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm overflow-hidden">
                {gameUrl}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyGameUrl}
                data-testid="button-copy-url"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this URL with your trade show visitors or display the QR code at your booth.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost"
            onClick={() => setLocation('/setup')}
            data-testid="button-create-another"
          >
            Create Another Game
          </Button>
        </div>

        {/* Modals */}
        <QRCodeModal 
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          gameUrl={gameUrl}
          gameName={game.companyName}
        />

        <ShareEmbedModal
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          gameId={id!}
          gameName={game.companyName}
        />
      </div>
    </div>
  );
}