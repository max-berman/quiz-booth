import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Edit3, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Question, Game } from "@shared/firebase-types";

export default function EditQuestions() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id: gameId } = useParams();
  
  // Get gameId from URL
  const currentGameId = gameId;
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionEdits, setQuestionEdits] = useState<Record<string, Partial<Question>>>({});

  // Get creator key from localStorage
  const creatorKey = localStorage.getItem(`creatorKey_${currentGameId}`);

  const { data: game } = useQuery<Game>({
    queryKey: ['/api/games', currentGameId],
    enabled: !!currentGameId,
  });

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['/api/games', currentGameId, 'questions'],
    enabled: !!currentGameId,
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, updates }: { questionId: string; updates: Partial<Question> }) => {
      if (!creatorKey) {
        throw new Error("Creator key required to edit questions");
      }
      
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Creator-Key': creatorKey,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update question' }));
        throw new Error(errorData.message || 'Failed to update question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', currentGameId, 'questions'] });
      toast({
        title: "Question updated",
        description: "Your changes have been saved successfully.",
      });
      setEditingQuestion(null);
      setQuestionEdits({});
    },
    onError: (error: any) => {
      console.error('Update question error:', error);
      toast({
        title: "Failed to update question",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (questionId: string) => {
    const question = questions?.find(q => q.id === questionId);
    if (question) {
      setQuestionEdits({
        [questionId]: {
          questionText: question.questionText,
          options: [...question.options],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
        }
      });
      setEditingQuestion(questionId);
    }
  };

  const handleSave = (questionId: string) => {
    const updates = questionEdits[questionId];
    if (updates) {
      updateQuestionMutation.mutate({ questionId, updates });
    }
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setQuestionEdits({});
  };

  const updateQuestionField = (questionId: string, field: keyof Question, value: any) => {
    setQuestionEdits(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      }
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestionEdits(prev => {
      const currentOptions = prev[questionId]?.options || [];
      const newOptions = [...currentOptions];
      newOptions[optionIndex] = value;
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          options: newOptions,
        }
      };
    });
  };

  if (!creatorKey) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Access Required</h2>
              <p className="text-muted-foreground mb-6">
                You need the creator key to edit questions. This key was provided when you created the game.
              </p>
              <Button onClick={() => setLocation('/')}>
                Return to Home
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
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-h1 text-foreground">Edit Questions</h1>
            <p className="text-muted-foreground">
              {game?.companyName} - {questions?.length || 0} questions
            </p>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions?.map((question, index) => (
            <Card key={question.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  {editingQuestion !== question.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question.id)}
                      data-testid={`button-edit-${question.id}`}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingQuestion === question.id ? (
                  // Edit mode
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                      <Textarea
                        id={`question-${question.id}`}
                        value={questionEdits[question.id]?.questionText || ''}
                        onChange={(e) => updateQuestionField(question.id, 'questionText', e.target.value)}
                        className="mt-1"
                        rows={3}
                        data-testid={`input-question-text-${question.id}`}
                      />
                    </div>

                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-3 mt-2">
                        {(questionEdits[question.id]?.options || question.options).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              questionEdits[question.id]?.correctAnswer === optionIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              className="flex-1"
                              data-testid={`input-option-${question.id}-${optionIndex}`}
                            />
                            <Button
                              variant={questionEdits[question.id]?.correctAnswer === optionIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestionField(question.id, 'correctAnswer', optionIndex)}
                              data-testid={`button-correct-${question.id}-${optionIndex}`}
                            >
                              {questionEdits[question.id]?.correctAnswer === optionIndex ? 'Correct' : 'Mark Correct'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`explanation-${question.id}`}>Explanation (Optional)</Label>
                      <Textarea
                        id={`explanation-${question.id}`}
                        value={questionEdits[question.id]?.explanation || ''}
                        onChange={(e) => updateQuestionField(question.id, 'explanation', e.target.value)}
                        className="mt-1"
                        rows={2}
                        placeholder="Explain why this is the correct answer..."
                        data-testid={`input-explanation-${question.id}`}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleSave(question.id)}
                        disabled={updateQuestionMutation.isPending}
                        data-testid={`button-save-${question.id}`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateQuestionMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateQuestionMutation.isPending}
                        data-testid={`button-cancel-${question.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium text-foreground" data-testid={`text-question-${question.id}`}>
                        {question.questionText}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center gap-3 p-3 rounded-md border ${
                            question.correctAnswer === optionIndex
                              ? 'bg-success/10 border-success text-success-foreground'
                              : 'bg-muted/50 border-border'
                          }`}
                          data-testid={`option-${question.id}-${optionIndex}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            question.correctAnswer === optionIndex ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <span className="flex-1">{option}</span>
                          {question.correctAnswer === optionIndex && (
                            <span className="text-sm font-medium text-success">Correct</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {questions?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No questions found for this game.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}