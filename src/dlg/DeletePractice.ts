import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";
import { Practice } from "../model/Practice";
import { FlashcardsAPI } from "../api/FlashcardsAPI";
import { FlashcardsStore } from "../store/FlashcardsStore";
import { PracticeFlashcard } from "../model/PracticeFlashcard";


export class DeletePractice implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        // Validate mandatory fields
        if (!req.params.practiceId) throw new ValidationError(400, "No practice id provided")

        // Extract user
        const user = userContext.email;

        const practiceId = String(req.params.practiceId);

        let client;

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            // 1. Delete practice
            const deletePracticesCount = await new PracticeStore(db, config).deletePractice(practiceId);

            // 2. Delete all flashcards
            const deletedFlashcardsCount = await new FlashcardsStore(db, config).deletePracticeFlashcards(practiceId);

            logger.compute(cid, `Delete [${deletePracticesCount}] practice and [${deletedFlashcardsCount}] flashcards`)

            return { deletePracticesCount, deletedFlashcardsCount }

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