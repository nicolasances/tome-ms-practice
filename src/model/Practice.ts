import { Request } from "express";
import moment from "moment-timezone";
import { WithId } from "mongodb";
import { ValidationError } from "toto-api-controller";
import { PracticeFlashcard } from "./PracticeFlashcard";

export class Practice {

    id?: string;
    user: string;
    topicId: string;
    type: PracticeType;
    startedOn: string; // YYYYMMDD
    finishedOn?: string; // YYYYMMDD
    score?: number; // Percentage

    constructor(
        topicId: string,
        user: string,
        type: PracticeType,
        startedOn: string,
        finishedOn?: string,
        score?: number,
        id?: string
    ) {
        this.topicId = topicId;
        this.user = user;
        this.type = type;
        this.startedOn = startedOn;
        this.finishedOn = finishedOn;
        this.score = score;
        if (id) {
            this.id = id;
        }
    }

    /**
     * Closes the practice, setting the finishedOn date and the score.
     * 
     * @param flashcards all the flashcards that were answered during the practice
     */
    closePractice(flashcards: PracticeFlashcard[]) {

        this.finishedOn = moment().tz("Europe/Rome").format("YYYYMMDD");

        const correctAnswers = flashcards.filter(fc => fc.correctlyAsnwerAt).length;
        this.score = Math.round((correctAnswers / flashcards.length) * 100);

    }

    toBSON() {
        return {
            topicId: this.topicId,
            user: this.user,
            type: this.type,
            startedOn: this.startedOn,
            finishedOn: this.finishedOn,
            score: this.score
        };
    }

    toJSON() {
        return {
            id: this.id, 
            topicId: this.topicId,
            user: this.user,
            type: this.type,
            startedOn: this.startedOn,
            finishedOn: this.finishedOn,
            score: this.score
        };
    }

    static fromRequest(req: Request, user: string): Practice {

        const body = req.body;

        if (!body.topicId) throw new ValidationError(400, `No Topic provided`);
        if (!body.type) throw new ValidationError(400, `No Practice type provided`);
        if (body.type !== "options" && body.type !== "gaps") {
            throw new ValidationError(400, `Invalid Practice type: ${body.type}`);
        }

        return new Practice(
            body.topicId, 
            user, 
            body.type, 
            moment().tz("Europe/Rome").format("YYYYMMDD")
        )
    }

    static fromBSON(bson: WithId<any>): Practice {
        
        return new Practice(
            bson.topicId,
            bson.user,
            bson.type,
            bson.startedOn,
            bson.finishedOn,
            bson.score,
            bson._id?.toString()
        );
    }

}

export type PracticeType = "options" | "gaps"