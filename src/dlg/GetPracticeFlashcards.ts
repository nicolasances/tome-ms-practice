import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";
import { FlashcardsStore } from "../store/FlashcardsStore";


export class GetPracticeFlashcards implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const body = req.body
        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        // Validate mandatory fields
        if (!req.params.practiceId) throw new ValidationError(400, "No practiceId provided")

        // Extract user
        const user = userContext.email;

        const practiceId = String(req.params.practiceId);

        let client;

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            // Retrieve the practice flashcards for the specified practice
            const store = new FlashcardsStore(db, config);

            const flashcards = await store.getPracticeFlashcards(practiceId);

            return { flashcards }


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