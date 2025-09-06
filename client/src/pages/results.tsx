import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, RotateCcw, Eye, Edit3 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShareEmbedModal } from "@/components/share-embed-modal";
import { ProfessionalFooter } from "@/components/professional-footer";
import type { Game, InsertPlayer } from "@shared/schema";

export default function Results() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [isScoreSaved, setIsScoreSaved] = useState(false);

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const score = parseInt(urlParams.get("score") || "0");
  const correctAnswers = parseInt(urlParams.get("correct") || "0");
  const totalQuestions = parseInt(urlParams.get("total") || "0");
  const timeSpent = parseInt(urlParams.get("time") || "0");

  const { data: game } = useQuery<Game>({
    queryKey: ["/api/games", id],
  });

  const saveScoreMutation = useMutation({
    mutationFn: async (playerData: InsertPlayer) => {
      const response = await apiRequest("POST", `/api/games/${id}/players`, playerData);
      return response.json();
    },
    onSuccess: () => {
      setIsScoreSaved(true);
      queryClient.invalidateQueries({ queryKey: ["/api/games", id, "leaderboard"] });
      toast({
        title: "Success!",
        description: "Your score has been saved to the leaderboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveScore = () => {
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const playerData: InsertPlayer = {
      name: playerName.trim(),
      company: playerEmail.trim() || undefined, // Using company field to store email for now
      gameId: id!,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
    };

    saveScoreMutation.mutate(playerData);
  };



  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white text-3xl" />
              </div>
              <h3 className="text-3xl font-bold text-dark mb-2">Game Complete!</h3>
              <p className="text-gray-600">Here are your results</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-xl">
                <div className="text-3xl font-bold text-accent mb-2">{score}</div>
                <div className="text-sm font-medium text-gray-700">Final Score</div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-2">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm font-medium text-gray-700">Correct Answers</div>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-6 rounded-xl">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm font-medium text-gray-700">Time Taken</div>
              </div>
            </div>

            {/* Player Registration */}
            {!isScoreSaved && (
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h4 className="text-lg font-semibold text-dark mb-4">Save Your Score to Leaderboard</h4>
                <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto mb-4">
                  <div>
                    <Label htmlFor="playerName">Name *</Label>
                    <Input
                      id="playerName"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerEmail">Email (Optional)</Label>
                    <Input
                      id="playerEmail"
                      type="email"
                      placeholder="your.email@company.com"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSaveScore}
                  disabled={saveScoreMutation.isPending}
                  className="px-6 py-3"
                >
                  Save Score
                </Button>
              </div>
            )}

            {isScoreSaved && (
              <div className="bg-accent/10 p-4 rounded-xl mb-6">
                <p className="text-accent font-semibold">✅ Score saved successfully!</p>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              {/* Primary Actions Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setLocation("/setup")}
                  className="px-6 py-3 w-full"
                  data-testid="button-play-again"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button
                  variant="default"
                  onClick={() => setLocation(`/leaderboard/${id}`)}
                  className="px-6 py-3 w-full !bg-black !text-white hover:!bg-gray-800"
                  data-testid="button-view-leaderboard"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Button>
              </div>
              
              {/* Share and Creator Actions */}
              <div className="grid grid-cols-1 gap-3">
                <ShareEmbedModal 
                  gameId={id} 
                  gameTitle={game?.companyName}
                />
                {/* Creator-only links */}
                {localStorage.getItem(`game-${id}-creator-key`) && (
                  <Button
                    onClick={() => setLocation(`/edit-questions/${id}`)}
                    variant="outline"
                    className="px-6 py-3 w-full"
                    data-testid="button-edit-questions"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Questions
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ProfessionalFooter />
    </div>
  );
}
