import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Settings, Gift, Wand2, Home, Trophy } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";
import type { InsertGame } from "@shared/schema";

export default function Setup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [categories, setCategories] = useState({
    companyFacts: true,
    industryKnowledge: true,
    funFacts: false,
    generalKnowledge: false,
    other: false,
  });
  const [customCategory, setCustomCategory] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Technology",
    productDescription: "",
    questionCount: 10,
    firstPrize: "75",
    secondPrize: "50",
    thirdPrize: "25",
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData: InsertGame) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: async (game) => {
      // Store the creator key in localStorage for later access to submissions
      localStorage.setItem(`game-${game.id}-creator-key`, game.creatorKey);

      setIsGenerating(true);
      try {
        await apiRequest("POST", `/api/games/${game.id}/generate-questions`);
        setLocation(`/game/${game.id}`);
      } catch (error) {
        console.error("Question generation failed:", error);
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try again.",
          variant: "destructive",
        });
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    const selectedCategories = Object.entries(categories)
      .filter(([, selected]) => selected)
      .map(([key]) => {
        switch (key) {
          case "companyFacts":
            return "Company Facts";
          case "industryKnowledge":
            return "Industry Knowledge";
          case "funFacts":
            return "Fun Facts";
          case "generalKnowledge":
            return "General Knowledge";
          case "other":
            return customCategory.trim() || "Custom Questions";
          default:
            return key;
        }
      });

    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question category.",
        variant: "destructive",
      });
      return;
    }

    const gameData: InsertGame = {
      ...formData,
      difficulty,
      categories: selectedCategories,
    };

    createGameMutation.mutate(gameData);
  };

  if (isGenerating) {
    return <LoadingSpinner message="Generating Your Trivia Questions" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" className="px-4 py-2">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" className="px-4 py-2">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-dark mb-2">
                Setup Your Trivia Game
              </h3>
              <p className="text-gray-600">
                Customize your questions and game settings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-dark flex items-center">
                    <Building className="text-primary mr-2 h-5 w-5" />
                    Company Information
                  </h4>

                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter your company name"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, industry: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Advertising and Marketing">
                          Advertising and Marketing
                        </SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Art and Design">
                          Art and Design
                        </SelectItem>
                        <SelectItem value="Automotive">Automotive</SelectItem>
                        <SelectItem value="Beauty and Cosmetics">
                          Beauty and Cosmetics
                        </SelectItem>
                        <SelectItem value="Construction">
                          Construction
                        </SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Environmental Services">
                          Environmental Services
                        </SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Finance and Banking">
                          Finance and Banking
                        </SelectItem>
                        <SelectItem value="Food and Beverage">
                          Food and Beverage
                        </SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Logistics and Transport">
                          Logistics and Transport
                        </SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Media and Communications">
                          Media and Communications
                        </SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Sports and Fitness">
                          Sports and Fitness
                        </SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Tourism and Hospitality">
                          Tourism and Hospitality
                        </SelectItem>
                        <SelectItem value="Wellness and Lifestyle">
                          Wellness and Lifestyle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="productDescription">
                      Product/Service Focus
                    </Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Describe your main products or services..."
                      value={formData.productDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          productDescription: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </div>

                {/* Game Settings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-dark flex items-center">
                    <Settings className="text-secondary mr-2 h-5 w-5" />
                    Game Settings
                  </h4>

                  <div>
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Select
                      value={formData.questionCount.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          questionCount: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions (Quick)</SelectItem>
                        <SelectItem value="10">
                          10 Questions (Standard)
                        </SelectItem>
                        <SelectItem value="15">
                          15 Questions (Extended)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Difficulty Level</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["easy", "medium", "hard"].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={difficulty === level ? "default" : "outline"}
                          className={
                            difficulty === level
                              ? "bg-accent hover:bg-accent/90"
                              : ""
                          }
                          onClick={() => setDifficulty(level)}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Question Categories</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(categories).map(([key, checked]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={checked}
                            onCheckedChange={(checked) =>
                              setCategories((prev) => ({
                                ...prev,
                                [key]: checked as boolean,
                              }))
                            }
                          />
                          <Label htmlFor={key} className="text-sm">
                            {key === "companyFacts"
                              ? "Company Facts"
                              : key === "industryKnowledge"
                                ? "Industry Knowledge"
                                : key === "funFacts"
                                  ? "Fun Facts"
                                  : key === "other"
                                    ? "Custom Questions"
                                    : "General Knowledge"}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {categories.other && (
                      <div className="mt-3">
                        <Label htmlFor="customCategory">
                          Describe your custom questions
                        </Label>
                        <Textarea
                          id="customCategory"
                          placeholder="e.g., provide some historical facts about the advergames"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prize Settings */}
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-dark flex items-center mb-4">
                  <Gift className="text-secondary mr-2 h-5 w-5" />
                  Prize Information (Optional)
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstPrize">1st Place Prize</Label>
                    <Input
                      id="firstPrize"
                      placeholder="e.g., $100 Gift Card"
                      value={formData.firstPrize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstPrize: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondPrize">2nd Place Prize</Label>
                    <Input
                      id="secondPrize"
                      placeholder="e.g., $50 Gift Card"
                      value={formData.secondPrize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondPrize: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="thirdPrize">3rd Place Prize</Label>
                    <Input
                      id="thirdPrize"
                      placeholder="e.g., Company Swag"
                      value={formData.thirdPrize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          thirdPrize: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={createGameMutation.isPending}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Questions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
