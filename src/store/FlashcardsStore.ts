import { Db } from "mongodb";
import { ControllerConfig } from "../Config";
import { PracticeFlashcard } from "../model/PracticeFlashcard";

export class FlashcardsStore {

    db: Db;
    fcCollection: string;

    constructor(db: Db, config: ControllerConfig) {
        this.db = db;
        this.fcCollection = config.getCollections().flashcards;
    }

    /**
     * Saves a bulk of flashcards
     * 
     * @returns the inserted count
     */
    async saveFlashcards(flashcards: PracticeFlashcard[]): Promise<number> {

        const result = await this.db.collection(this.fcCollection).insertMany(flashcards.map(fc => fc.toBSON()))

        return result.insertedCount

    }

    /**
     * Deletes all flashcards related to the specified practice
     * 
     * @param practiceId the practice
     * @returns the deleted count
     */
    async deletePracticeFlashcards(practiceId: string): Promise<number> {

        const result = await this.db.collection(this.fcCollection).deleteMany({ practiceId: practiceId });

        return result.deletedCount;
    }

}