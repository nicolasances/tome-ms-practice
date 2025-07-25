import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";


export class GetOngoingPractices implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        let client;

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            if (req.query.topicId) {

                const practice = await new PracticeStore(db, config).findUnfinishedPractice(String(req.query.topicId));

                if (!practice) return { practice: [] };

                return { practices: [practice.toJSON()] }
            }
            else return { practices: await new PracticeStore(db, config).findAllUnfinishedPractices() }

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