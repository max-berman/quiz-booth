import * as admin from 'firebase-admin';

const db = admin.firestore();

export interface GenerationProgress {
  gameId: string;
  status: 'starting' | 'generating_title' | 'generating_questions' | 'saving_questions' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  timestamp: Date;
  error?: string;
}

export class ProgressTracker {
  private gameId: string;
  private progressDocRef: FirebaseFirestore.DocumentReference;

  constructor(gameId: string) {
    this.gameId = gameId;
    this.progressDocRef = db.collection('generationProgress').doc(gameId);
  }

  async updateProgress(status: GenerationProgress['status'], progress: number, message: string, error?: string): Promise<void> {
    const progressData: any = {
      gameId: this.gameId,
      status,
      progress,
      message,
      timestamp: new Date(),
    };

    // Only include error if it exists and is a non-empty string
    if (error && error.trim().length > 0) {
      progressData.error = error;
    }

    try {
      await this.progressDocRef.set(progressData, { merge: true });
      console.log(`Progress update for ${this.gameId}: ${status} - ${progress}% - ${message}`);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  async startGeneration(): Promise<void> {
    // Create progress document immediately to ensure UI can see it
    await this.updateProgress('starting', 5, 'Starting question generation process...');
  }

  async generatingTitle(): Promise<void> {
    await this.updateProgress('generating_title', 10, 'Generating game title...');
  }

  async generatingQuestions(totalQuestions: number, currentQuestion: number = 0, batchInfo?: { currentBatch: number, totalBatches: number }): Promise<void> {
    const progress = Math.min(10 + Math.floor((currentQuestion / totalQuestions) * 80), 90);
    let message = 'Generating questions...';

    if (currentQuestion > 0) {
      if (batchInfo) {
        message = `Generating questions... (${currentQuestion}/${totalQuestions}) - Batch ${batchInfo.currentBatch}/${batchInfo.totalBatches}`;
      } else {
        message = `Generating questions... (${currentQuestion}/${totalQuestions})`;
      }
    }

    await this.updateProgress('generating_questions', progress, message);
  }

  async savingQuestions(): Promise<void> {
    await this.updateProgress('saving_questions', 95, 'Saving questions to database...');
  }

  async completed(): Promise<void> {
    await this.updateProgress('completed', 100, 'Question generation completed successfully');
  }

  async error(errorMessage: string): Promise<void> {
    await this.updateProgress('error', 0, 'Question generation failed', errorMessage);
  }

  async cleanup(): Promise<void> {
    try {
      // Delete progress document after a delay to allow client to read it
      setTimeout(async () => {
        try {
          await this.progressDocRef.delete();
        } catch (error) {
          console.error('Failed to cleanup progress document:', error);
        }
      }, 30000); // 30 seconds delay
    } catch (error) {
      console.error('Failed to schedule cleanup:', error);
    }
  }
}
