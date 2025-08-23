import moment from "moment-timezone";
import { MultipleOptionsFlashcard, SectionTimelineFlashcard } from "../api/FlashcardsAPI";
import { WithId } from "mongodb";

type Flashcard = MultipleOptionsFlashcard | SectionTimelineFlashcard;

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

    static fromBSON(bson: WithId<any>): PracticeFlashcard {

        return new PracticeFlashcard(
            bson.practiceId,
            bson.originalFlashcard,
            bson.numWrongAnswers,
            bson.correctlyAsnwerAt,
            bson._id.toHexString()
        );
    }

    /**
     * Constructs a flashcard copying all the base fields from the flashcard downloaded from the API 
     * 
     * @param fc the flashcard as downloaded from the Flashcard API
     */
    static fromFlashcardAPI(fc: Flashcard, practiceId: string): PracticeFlashcard {

        return new PracticeFlashcard(practiceId, fc);

    }

    /**
     * Records the answer to the flashcard and updates it accordingly.
     */
    answer(isCorrect: boolean) {

        if (isCorrect) {
            this.correctlyAsnwerAt = moment().tz("Europe/Rome").format("YYYYMMDD HH:mm");
            return true;
        }

        if (!this.numWrongAnswers) this.numWrongAnswers = 0;

        this.numWrongAnswers++;
        return false;

    }

    toBSON(): any {
        const { id, ...rest } = this;
        return { ...rest };
    }

}