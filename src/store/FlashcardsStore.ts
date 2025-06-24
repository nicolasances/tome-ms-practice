import { Db, ObjectId } from "mongodb";
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
     * Update the card 
     */
    async updateFlashcard(flashcard: PracticeFlashcard): Promise<number> {

        const result = await this.db.collection(this.fcCollection).updateOne(
            { _id: new ObjectId(flashcard.id) },
            { $set: flashcard.toBSON() }
        );

        return result.modifiedCount;

    }

    /**
     * Counts the number of unanswered flashcards for a given practice
     * 
     * @param practiceId the practiceId to count the unanswered flashcards
     * @returns the number of unanswered flashcards for the specified practiceId
     */
    async countUnansweredFlashcards(practiceId: string): Promise<number> {

        const count = await this.db.collection(this.fcCollection).countDocuments({
            practiceId: practiceId,
            $or: [
                { correctlyAsnwerAt: { $exists: false } },
                { correctlyAsnwerAt: null }
            ]
        });

        return count;
    }

    /**
     * Retrieves the flashcards for the specified practiceId
     */
    async getPracticeFlashcards(practiceId: string): Promise<PracticeFlashcard[]> {

        const cards = await this.db.collection(this.fcCollection).find({ practiceId: practiceId }).toArray();

        return cards.map(fc => PracticeFlashcard.fromBSON(fc));
    }

    /**
     * Retrieves a flashcard for the specified practiceId and flashcardId
     */
    async getFlashcard(practiceId: string, flashcardId: string): Promise<PracticeFlashcard | null> {

        const fc = await this.db.collection(this.fcCollection).findOne({ practiceId: practiceId, _id: new ObjectId(flashcardId) });

        if (!fc) return null;

        return PracticeFlashcard.fromBSON(fc);
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