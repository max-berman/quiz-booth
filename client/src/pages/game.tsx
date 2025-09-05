import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Zap, Clock, Home, ArrowRight } from "lucide-react";
import type { Game, Question } from "@shared/schema";

export default function GamePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: game } = useQuery<Game>({
    queryKey: ["/api/games", id],
  });

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/games", id, "questions"],
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const progressPercentage = questions
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      // Time's up, auto-advance
      handleNextQuestion();
    }
  }, [timeLeft, isAnswered]);

  // Reset timer for new question
  useEffect(() => {
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowExplanation(true);

    const timeSpent = 30 - timeLeft;
    const isCorrect = answerIndex === currentQuestion?.correctAnswer;

    if (isCorrect) {
      const basePoints = 100;
      const timeBonus = Math.max(0, 30 - timeSpent) * 2; // Up to 60 bonus points for speed
      const streakBonus = streak * 10; // 10 points per streak
      const questionPoints = basePoints + timeBonus + streakBonus;

      setScore((prev) => prev + questionPoints);
      setCorrectAnswers((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
      setStreak(0);
    }

    setTotalTime((prev) => prev + timeSpent);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Game finished
      const finalTimeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
      const gameResult = {
        score,
        correctAnswers,
        totalQuestions: questions?.length || 0,
        timeSpent: finalTimeSpent,
      };

      setLocation(
        `/results/${id}?score=${score}&correct=${correctAnswers}&total=${questions?.length}&time=${finalTimeSpent}`,
      );
    }
  };

  if (isLoading || !questions || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Score: {score}
              </div>
            </div>
            
            {isAnswered && (
              <Button
                size="sm"
                onClick={handleNextQuestion}
                className="flex items-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            )}
            
            {!isAnswered && (
              <div className="w-[84px]" /> /* Placeholder to center the middle content */
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Game Progress */}
        <div className="space-y-4">
          <Progress value={progressPercentage} className="h-3 bg-muted" />
        </div>

        {/* Timer and Stats - Compact version */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 bg-card/50 rounded-lg border">
            <Clock className={`h-4 w-4 mx-auto mb-1 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`} />
            <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-success" />
            <div className="text-lg font-bold text-success">{correctAnswers}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border">
            <XCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="text-lg font-bold text-destructive">{wrongAnswers}</div>
            <div className="text-xs text-muted-foreground">Wrong</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg border">
            <Zap className="h-4 w-4 mx-auto mb-1 text-secondary" />
            <div className="text-lg font-bold text-secondary">{streak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>

        {/* Question Card - Optimized for future customization */}
        <Card className="game-card animate-slide-up border-2 shadow-lg">
          <CardContent className="p-6 md:p-8">
            {/* Question Text - Optimized for readability */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed text-center">
                  {currentQuestion?.questionText}
                </h2>
              </div>
              
              {/* Answer Options - Better spacing and visual hierarchy */}
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      isAnswered
                        ? selectedAnswer === index
                          ? index === currentQuestion.correctAnswer
                            ? "bg-success/20 border-success text-success-foreground"
                            : "bg-destructive/20 border-destructive text-destructive-foreground"
                          : index === currentQuestion.correctAnswer
                            ? "bg-success/20 border-success text-success-foreground"
                            : "bg-muted/50 border-muted"
                        : "bg-card border-border hover:border-primary hover:bg-primary/5 hover:scale-[1.02]"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isAnswered && selectedAnswer === index
                            ? index === currentQuestion.correctAnswer
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                            : isAnswered && index === currentQuestion.correctAnswer
                              ? "bg-success text-success-foreground"
                              : "bg-primary/20 text-primary"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base md:text-lg font-medium">{option}</span>
                      </div>
                      {isAnswered &&
                        selectedAnswer === index &&
                        (index === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-6 w-6 text-success" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        ))}
                      {isAnswered &&
                        selectedAnswer !== index &&
                        index === currentQuestion.correctAnswer && (
                          <CheckCircle className="h-6 w-6 text-success" />
                        )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation - Enhanced styling */}
              {showExplanation && currentQuestion?.explanation && (
                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 animate-slide-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">💡</span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground">Explanation</h3>
                  </div>
                  <p className="text-foreground leading-relaxed text-base">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action - Only show if not answered (since we have top button) */}
            {isAnswered && (
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  {currentQuestionIndex < questions.length - 1 
                    ? "Ready for the next question?"
                    : "Great job! See your final results."}
                </p>
                <Button
                  type="button"
                  onClick={handleNextQuestion}
                  size="lg"
                  className="px-8 py-3 text-base font-semibold"
                >
                  {currentQuestionIndex < questions.length - 1
                    ? "Continue →"
                    : "View Results 🎉"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
