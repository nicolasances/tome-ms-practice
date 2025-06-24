import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";
import { Practice } from "../model/Practice";
import { FlashcardsAPI } from "../api/FlashcardsAPI";
import { FlashcardsStore } from "../store/FlashcardsStore";
import { PracticeFlashcard } from "../model/PracticeFlashcard";


/**
 * This Delegate starts a new practice.
 */
export class PostPractice implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const body = req.body
        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        // Validate mandatory fields
        if (!body.topicId) throw new ValidationError(400, "No topicId provided")

        // Extract user
        const user = userContext.email;

        const topicId = body.topicId;

        let client;

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            const practiceStore = new PracticeStore(db, config);

            // 0. Check that there is no unfinished practice first
            const ongoingPractice = await practiceStore.findUnfinishedPractice(topicId);

            if (ongoingPractice) throw new ValidationError(400, `Ongoing practice found: [ ${ongoingPractice.id} ] on topic ${topicId}. Close that one first.`)

            // 0. Create the Practice
            const practice = Practice.fromRequest(req, user);

            // 1. Get the flashcards for the Topic and for the selected practice type 
            const { flashcards } = await new FlashcardsAPI(execContext, String(req.headers['authorization'] ?? req.headers['Authorization'])).getFlashcards(topicId);

            // 2. Save the practice
            const practiceId = await practiceStore.savePractice(practice);

            // 3. Save the flashcards
            const fcInsertedCount = await new FlashcardsStore(db, config).saveFlashcards(flashcards.map(fc => PracticeFlashcard.fromFlashcardAPI(fc, practiceId)))

            // Return something
            return {
                practiceId: practiceId,
                flashcardsInsertedCount: fcInsertedCount
            }


        } catch (error) {

            logger.compute(cid, `${error}`, "error")

            if (error instanceof ValidationError || error instanceof TotoRuntimeError) {
                throw error;
            }
            else {
                console.log(error);
                throw error;
            }

        }
        finally {
            if (client) client.close();
        }

    }

}