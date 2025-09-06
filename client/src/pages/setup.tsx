import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getAuthHeaders } from "@/lib/auth-utils";
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
import {
  Building,
  Settings,
  Gift,
  Wand2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ProfessionalFooter } from "@/components/professional-footer";
import type { InsertGame } from "@shared/firebase-types";

export default function Setup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
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
  const [customIndustry, setCustomIndustry] = useState("");
  const [focusedSection, setFocusedSection] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "Technology",
    productDescription: "",
    questionCount: "10",
    firstPrize: "75",
    secondPrize: "50",
    thirdPrize: "25",
  });

  const [prizes, setPrizes] = useState([
    { placement: "1st Place", prize: "" },
    { placement: "2nd Place", prize: "" },
    { placement: "3rd Place", prize: "" },
  ]);

  const createGameMutation = useMutation({
    mutationFn: async (gameData: InsertGame) => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      return response.json();
    },
    onSuccess: async (game) => {
      setIsGenerating(true);
      try {
        const headers = await getAuthHeaders();
        await fetch(`/api/games/${game.id}/generate-questions`, {
          method: "POST",
          headers,
        });
        setLocation(`/game-created/${game.id}`);
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

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a trivia game.",
        variant: "destructive",
      });
      setLocation("/auth/sign-in");
      return;
    }

    if (!formData.companyName.trim()) {
      toast({
        title: "Error",
        description: "Company name or website is required.",
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

    // Filter out empty prizes
    const validPrizes = prizes.filter(
      (p) => p.placement.trim() && p.prize.trim(),
    );

    const gameData: InsertGame = {
      ...formData,
      questionCount: parseInt(formData.questionCount),
      difficulty,
      categories: selectedCategories,
      prizes: validPrizes.length > 0 ? validPrizes : null,
    };

    createGameMutation.mutate(gameData);
  };

  // Check if sections are complete
  const checkCompanyComplete = () => {
    return formData.companyName.trim() && formData.industry;
  };

  const checkSettingsComplete = () => {
    const selectedCategories = Object.values(categories).some(Boolean);
    return selectedCategories && formData.questionCount;
  };

  const steps = useMemo(() => {
    const companyComplete = formData.companyName.trim() && formData.industry;
    const settingsComplete = Object.values(categories).some(Boolean) && formData.questionCount;
    
    return [
      {
        id: 1,
        title: "Company Info",
        icon: Building,
        complete: companyComplete,
      },
      {
        id: 2,
        title: "Game Settings",
        icon: Settings,
        complete: settingsComplete,
      },
      { id: 3, title: "Prizes (Optional)", icon: Gift, complete: true },
    ];
  }, [
    formData.companyName,
    formData.industry,
    formData.questionCount,
    categories,
  ]);

  if (isGenerating) {
    return <LoadingSpinner message="Generating Your Trivia Questions" />;
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Create Your <span className="text-primary">Trivia Game</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate engaging AI-powered trivia questions for your trade show
            booth in just a few minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    step.complete
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {step.complete ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      step.complete
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 rounded ${
                      step.complete ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Information Section */}
              <div
                className={`p-6 rounded-xl border-2 transition-all ${
                  focusedSection === 1
                    ? "border-primary bg-muted"
                    : "border-border bg-muted"
                }`}
                onFocus={() => setFocusedSection(1)}
                onBlur={() => setFocusedSection(null)}
                tabIndex={0}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <Building className="text-primary mr-3 h-6 w-6" />
                    Company Information
                    {checkCompanyComplete() && (
                      <CheckCircle className="ml-2 h-5 w-5 text-primary" />
                    )}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="companyName"
                      className="text-base font-medium"
                    >
                      Company Name or Website *
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name or website URL"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className={`mt-2 h-12 text-base border-gray-300 ${
                        formData.companyName.trim() ? "border-primary" : ""
                      }`}
                      required
                    />
                    <div className="flex items-start gap-2 mt-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Provide a website URL for more relevant AI-generated
                        questions, or enter your company name.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-base font-medium">
                      Industry *
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, industry: value }))
                      }
                    >
                      <SelectTrigger className="mt-2 h-12 text-base border-gray-300">
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
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.industry === "Other" && (
                    <div>
                      <Label
                        htmlFor="customIndustry"
                        className="text-base font-medium"
                      >
                        Custom Industry *
                      </Label>
                      <Input
                        id="customIndustry"
                        placeholder="Enter your industry"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        className="mt-2 h-12 text-base border-gray-300"
                        required
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label
                      htmlFor="productDescription"
                      className="text-base font-medium"
                    >
                      Product/Service Focus (Optional)
                    </Label>
                    <Textarea
                      id="productDescription"
                      placeholder="Describe your main products or services to get more targeted questions..."
                      value={formData.productDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          productDescription: e.target.value,
                        }))
                      }
                      className="mt-2 text-base border-gray-300"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Game Settings Section */}
              <div
                className={`p-6 rounded-xl border-2 transition-all ${
                  focusedSection === 2
                    ? "border-primary bg-muted"
                    : "border-border bg-muted"
                }`}
                onFocus={() => setFocusedSection(2)}
                onBlur={() => setFocusedSection(null)}
                tabIndex={0}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <Settings className="text-secondary mr-3 h-6 w-6" />
                    Game Settings
                    {checkSettingsComplete() && (
                      <CheckCircle className="ml-2 h-5 w-5 text-primary" />
                    )}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="questionCount"
                      className="text-base font-medium"
                    >
                      Number of Questions
                    </Label>
                    <Select
                      value={formData.questionCount}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          questionCount: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2 h-12 text-base border-gray-300">
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
                    <Label className="text-base font-medium">
                      Difficulty Level
                    </Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {[
                        {
                          level: "easy",
                          label: "Easy",
                          desc: "Basic questions",
                        },
                        {
                          level: "medium",
                          label: "Medium",
                          desc: "Moderate difficulty",
                        },
                        {
                          level: "hard",
                          label: "Hard",
                          desc: "Challenging questions",
                        },
                      ].map(({ level, label, desc }) => (
                        <Button
                          key={level}
                          type="button"
                          variant={difficulty === level ? "default" : "outline"}
                          className={`h-8 flex flex-col hover:scale-100 ${
                            difficulty === level
                              ? "bg-primary border-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => setDifficulty(level)}
                        >
                          <span className="font-medium">{label}</span>
                          {/* <span className="text-xs opacity-75">{desc}</span> */}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-base font-medium">
                      Question Categories *
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {[
                        {
                          key: "companyFacts",
                          label: "Company Facts",
                          desc: "Questions about your company",
                        },
                        {
                          key: "industryKnowledge",
                          label: "Industry Knowledge",
                          desc: "Questions about your industry",
                        },
                        {
                          key: "funFacts",
                          label: "Fun Facts",
                          desc: "Entertaining trivia",
                        },
                        {
                          key: "generalKnowledge",
                          label: "General Knowledge",
                          desc: "Broad topics",
                        },
                        {
                          key: "other",
                          label: "Custom Questions",
                          desc: "Your specific topics",
                        },
                      ].map(({ key, label, desc }) => (
                        <div
                          key={key}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            categories[key as keyof typeof categories]
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setCategories((prev) => ({
                              ...prev,
                              [key]: !prev[key as keyof typeof prev],
                            }))
                          }
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={key}
                              checked={
                                categories[key as keyof typeof categories]
                              }
                              onCheckedChange={(checked) =>
                                setCategories((prev) => ({
                                  ...prev,
                                  [key]: checked as boolean,
                                }))
                              }
                            />
                            <div>
                              <Label
                                htmlFor={key}
                                className="font-medium cursor-pointer"
                              >
                                {label}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {categories.other && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Label
                          htmlFor="customCategory"
                          className="text-base font-medium"
                        >
                          Describe your custom questions
                        </Label>
                        <Textarea
                          id="customCategory"
                          placeholder="e.g., questions about sustainable packaging, our company history, or specific product features"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="mt-2 border-gray-300"
                          rows={2}
                        />
                      </div>
                    )}
                    {!Object.values(categories).some(Boolean) && (
                      <div className="flex items-center gap-2 mt-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Please select at least one category
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prize Settings Section */}
              <div
                className={`p-6 rounded-xl border-2 transition-all ${
                  focusedSection === 3
                    ? "border-primary bg-muted"
                    : "border-border bg-muted"
                }`}
                onFocus={() => setFocusedSection(3)}
                onBlur={() => setFocusedSection(null)}
                tabIndex={0}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center">
                    <Gift className="text-secondary mr-3 h-6 w-6" />
                    Prize Information (Optional)
                    <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPrizes([...prizes, { placement: "", prize: "" }])
                    }
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Prize
                  </Button>
                </div>

                <div className="space-y-4">
                  {prizes.map((prize, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-end p-4 bg-card rounded-lg border"
                    >
                      <div className="flex-1">
                        <Label
                          htmlFor={`placement-${index}`}
                          className="text-base font-medium"
                        >
                          Placement
                        </Label>
                        <Input
                          id={`placement-${index}`}
                          placeholder="e.g., 1st Place, Top 10, etc."
                          value={prize.placement}
                          onChange={(e) => {
                            const updatedPrizes = [...prizes];
                            updatedPrizes[index].placement = e.target.value;
                            setPrizes(updatedPrizes);
                          }}
                          className="mt-2 h-11 border-gray-300"
                        />
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor={`prize-${index}`}
                          className="text-base font-medium"
                        >
                          Prize
                        </Label>
                        <Input
                          id={`prize-${index}`}
                          placeholder="e.g., $100 Gift Card"
                          value={prize.prize}
                          onChange={(e) => {
                            const updatedPrizes = [...prizes];
                            updatedPrizes[index].prize = e.target.value;
                            setPrizes(updatedPrizes);
                          }}
                          className="mt-2 h-11 border-gray-300"
                        />
                      </div>
                      {prizes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedPrizes = prizes.filter(
                              (_, i) => i !== index,
                            );
                            setPrizes(updatedPrizes);
                          }}
                          className="h-11 w-11 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                    <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Add prizes to motivate participation. You can customize
                      placements (e.g., "4th Place", "Top 10", "Best Score") to
                      match your event needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="bg-muted p-8 rounded-xl border">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      Ready to generate your trivia game!
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground max-w-md mx-auto">
                    Our AI will create {formData.questionCount} {difficulty}{" "}
                    questions
                    {Object.values(categories).filter(Boolean).length > 0 && (
                      <>
                        {" "}
                        covering{" "}
                        {Object.values(categories).filter(Boolean).length}{" "}
                        categories
                      </>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="px-12 py-4 font-bold text-lg rounded-xl"
                    disabled={
                      createGameMutation.isPending ||
                      !checkCompanyComplete() ||
                      !checkSettingsComplete()
                    }
                  >
                    <Wand2 className="mr-3 h-5 w-5" />
                    {createGameMutation.isPending
                      ? "Creating..."
                      : "Generate Trivia Game"}
                  </Button>

                  {(!checkCompanyComplete() || !checkSettingsComplete()) && (
                    <div className="flex items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Please complete required sections above
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="mt-16">
        <ProfessionalFooter />
      </div>
    </div>
  );
}
