
export class CardAnsweredEvent {

    practiceId: string;
    flashcardId: string; 
    practiceFlashcardId: string; 

    isCorrect: boolean; // Whether the answer was correct
    numQuestions: number; 
    flashcardType: string; 

    constructor(practiceId: string, flashcardId: string, practiceFlashcardId: string, isCorrect: boolean, numQuestions: number, flashcardType: string) {
        this.practiceId = practiceId;
        this.flashcardId = flashcardId;
        this.practiceFlashcardId = practiceFlashcardId;
        this.isCorrect = isCorrect;
        this.numQuestions = numQuestions;
        this.flashcardType = flashcardType;
    }

}