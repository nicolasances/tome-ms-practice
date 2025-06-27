import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";


/**
 * Retrieves all the practices, with some filtering options.
 */
export class GetPractices implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const body = req.body
        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        // Extract user
        const user = userContext.email;

        const onlyFinished = req.query.finished === "true";
        const topicId = String(req.params.topicId);

        let client;

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            // Find all the historical practices for the given topic
            const practices = await new PracticeStore(db, config).findPractices({
                startedFrom: req.query.startedFrom ? String(req.query.startedFrom) : undefined,
            })

            return {
                practices: practices.map(practice => practice.toJSON()),
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