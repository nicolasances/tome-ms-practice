import { Flashcard } from "../api/FlashcardsAPI";

export class PracticeFlashcard {
    
    practiceId: string; // Relates to a Practice
    originalFlashcard: Flashcard;  

    numWrongAnswers?: number;    // number of wrong answers from the user before getting the right one
    correctlyAsnwerAt?: string;  // YYYYMMDD HH:mm
    id?: string; // Id as stored in this db

    constructor(
        practiceId: string,
        originalFlashcard: Flashcard,
        numWrongAnswers?: number,
        correctlyAsnwerAt?: string,
        id?: string
    ) {
        this.practiceId = practiceId;
        this.originalFlashcard = originalFlashcard;
        this.numWrongAnswers = numWrongAnswers;
        this.correctlyAsnwerAt = correctlyAsnwerAt;
        this.id = id;
    }

    /**
     * Constructs a flashcard copying all the base fields from the flashcard downloaded from the API 
     * 
     * @param fc the flashcard as downloaded from the Flashcard API
     */
    static fromFlashcardAPI(fc: Flashcard, practiceId: string): PracticeFlashcard {

        return new PracticeFlashcard(practiceId, fc);

    }

    toBSON(): any {
        const { id, ...rest } = this;
        return { ...rest };
    }

}