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
  const progressPercentage = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
      
      setScore(prev => prev + questionPoints);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
    }
    
    setTotalTime(prev => prev + timeSpent);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Game finished
      const finalTimeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
      const gameResult = {
        score,
        correctAnswers,
        totalQuestions: questions?.length || 0,
        timeSpent: finalTimeSpent,
      };
      
      setLocation(`/results/${id}?score=${score}&correct=${correctAnswers}&total=${questions?.length}&time=${finalTimeSpent}`);
    }
  };

  const getAnswerButtonClass = (answerIndex: number) => {
    if (!isAnswered) {
      return "w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200";
    }
    
    if (answerIndex === currentQuestion?.correctAnswer) {
      return "w-full p-4 text-left border-2 border-accent bg-accent/10 rounded-xl text-accent";
    }
    
    if (answerIndex === selectedAnswer && answerIndex !== currentQuestion?.correctAnswer) {
      return "w-full p-4 text-left border-2 border-warning bg-warning/10 rounded-xl text-warning";
    }
    
    return "w-full p-4 text-left border-2 border-gray-200 rounded-xl opacity-50";
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Game Header */}
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-dark">{game.companyName} Trivia Challenge</h3>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-4">
          <CardContent className="p-8">
            <div className="mb-8">
              <h4 className="text-2xl font-semibold text-dark mb-6">
                {currentQuestion?.questionText}
              </h4>
              <div className="space-y-4">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    className={getAnswerButtonClass(index)}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                  >
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>{" "}
                    {option}
                  </button>
                ))}
              </div>
              
              {showExplanation && currentQuestion?.explanation && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Time: {timeLeft}s
              </div>
              <Button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="px-6 py-3"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center space-x-8 text-sm">
              <div className="flex items-center text-accent">
                <CheckCircle className="mr-1 h-4 w-4" />
                Correct: {correctAnswers}
              </div>
              <div className="flex items-center text-warning">
                <XCircle className="mr-1 h-4 w-4" />
                Wrong: {wrongAnswers}
              </div>
              <div className="flex items-center text-gray-600">
                <Zap className="mr-1 h-4 w-4" />
                Streak: {streak}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
