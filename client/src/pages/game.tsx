import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Zap, Clock } from "lucide-react";
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Game Header */}
        <Card className="game-card">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-h3 text-foreground">
                  <span className="text-primary">
                    {game.companyName}
                  </span>{" "}
                  Trivia Challenge
                </h3>
                <p className="text-muted-foreground text-lg">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary ">
                  {score}
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-4 bg-muted" />
          </CardContent>
        </Card>

        {/* Timer and Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="stat-card bg-card border border-border p-4">
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div
                className={`text-xl font-bold text-primary ${timeLeft <= 10 ? "animate-pulse" : ""}`}
              >
                {timeLeft}s
              </div>
              <div className="text-sm text-muted-foreground">Time Left</div>
            </div>
          </div>
          <div className="stat-card bg-card border border-border p-4">
            <div className="text-center">
              <CheckCircle className="h-5 w-5 mx-auto mb-2 text-success" />
              <div className="text-xl font-bold text-success">
                {correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
          </div>
          <div className="stat-card bg-card border border-border p-4">
            <div className="text-center">
              <XCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
              <div className="text-xl font-bold text-destructive">
                {wrongAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
          </div>
          <div className="stat-card bg-card border border-border p-4">
            <div className="text-center">
              <Zap className="h-5 w-5 mx-auto mb-2 text-secondary" />
              <div className="text-xl font-bold text-secondary">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card
          className="game-card animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <CardContent className="p-8">
            <div className="mb-8">
              <h4 className="text-naknick-h3 text-foreground mb-8 leading-relaxed">
                {currentQuestion?.questionText}
              </h4>
              <div className="space-y-4">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`answer-btn ${
                      isAnswered
                        ? selectedAnswer === index
                          ? index === currentQuestion.correctAnswer
                            ? "correct"
                            : "incorrect"
                          : index === currentQuestion.correctAnswer
                            ? "correct"
                            : ""
                        : ""
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    onFocus={(e) => e.currentTarget.blur()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswered &&
                        selectedAnswer === index &&
                        (index === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-6 w-6 text-accent" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        ))}
                      {isAnswered &&
                        selectedAnswer !== index &&
                        index === currentQuestion.correctAnswer && (
                          <CheckCircle className="h-6 w-6 text-accent" />
                        )}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && currentQuestion?.explanation && (
                <div className="mt-8 p-6 bg-gradient-secondary rounded-2xl animate-slide-up">
                  <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                    💡 Explanation
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {isAnswered && (
              <div
                className="text-center animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn-naknick px-12 py-4 text-lg"
                  onFocus={(e) => e.currentTarget.blur()}
                >
                  {currentQuestionIndex < questions.length - 1
                    ? "Next Question →"
                    : "Finish Game 🎉"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
