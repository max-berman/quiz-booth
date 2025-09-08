import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors
      });
    }
  };
};

// Game creation schema
export const gameSchema = z.object({
  companyName: z.string().min(1).max(100),
  industry: z.string().min(1).max(50),
  questionCount: z.number().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  categories: z.array(z.string()).min(1).max(10),
  productDescription: z.string().max(500).optional().nullable(),
  firstPrize: z.string().max(100).optional().nullable(),
  secondPrize: z.string().max(100).optional().nullable(),
  thirdPrize: z.string().max(100).optional().nullable(),
  prizes: z.array(z.object({
    placement: z.number(),
    prize: z.string()
  })).optional().nullable()
});

// Player submission schema
export const playerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  score: z.number().min(0),
  timeSpent: z.number().min(0),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.number(),
    isCorrect: z.boolean(),
    timeSpent: z.number()
  }))
});

// Question creation schema
export const questionSchema = z.object({
  questionText: z.string().min(1).max(500),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().max(500).optional().nullable()
});

// Question update schema
export const questionUpdateSchema = z.object({
  questionText: z.string().min(1).max(500).optional(),
  options: z.array(z.string()).length(4).optional(),
  correctAnswer: z.number().min(0).max(3).optional(),
  explanation: z.string().max(500).optional().nullable()
});
