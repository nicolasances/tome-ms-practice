import { Request } from "express";
import { ExecutionContext, TotoDelegate, TotoRuntimeError, UserContext, ValidationError } from "toto-api-controller";
import { ControllerConfig } from "../Config";
import { PracticeStore } from "../store/PraticeStore";
import { FlashcardsStore } from "../store/FlashcardsStore";
import { computePracticeScore, computePracticeStatistics } from "../util/PracticeUtils";
import { EventPublisher, EVENTS } from "../evt/EventPublisher";

/**
 * Post and answer to a flashcard.
 * 
 * This endpoint allows the user to post an answer to a flashcard (whether it's a right or wrong answer). 
 * The caller provides the practiceId and the flashcardId in the request body and this delegate will: 
 * - check if the answer is right or wrong
 * - update the flashcard accordingly
 * 
 * If there are no more flashcards to answer, the practice is marked as finished and the overall score is computed.
 */
export class PostAnswer implements TotoDelegate {

    async do(req: Request, userContext: UserContext, execContext: ExecutionContext): Promise<any> {

        const body = req.body
        const logger = execContext.logger;
        const cid = execContext.cid;
        const config = execContext.config as ControllerConfig;

        // Validate mandatory fields
        if (!req.params.practiceId) throw new ValidationError(400, "No practiceId provided");
        if (!req.params.flashcardId) throw new ValidationError(400, "No flashcardId provided");
        if (body.isCorrect == null) throw new ValidationError(400, "No isCorrect provided");

        const practiceId = String(req.params.practiceId);
        const flashcardId = String(req.params.flashcardId);

        // Extract user
        const user = userContext.email;

        let client;

        logger.compute(cid, `Processing answer for practice ${practiceId} and flashcard ${flashcardId} by user ${user}. Selected Answer Index: ${body.selectedAnswerIndex}`, "info");

        try {

            // Instantiate the DB
            client = await config.getMongoClient();
            const db = client.db(config.getDBName());

            const flashcardStore = new FlashcardsStore(db, config);

            // Retrieve the flashcard for the specified practice
            const card = await flashcardStore.getFlashcard(practiceId, flashcardId);

            if (!card) throw new ValidationError(404, `Flashcard ${flashcardId} not found for practice ${practiceId}`);
            if (card.correctlyAsnwerAt != null) throw new ValidationError(400, `Flashcard ${flashcardId} already answered`);

            // Update the flashcard with the answer
            let isCorrect = body.isCorrect;
            card.answer(body.isCorrect);

            logger.compute(cid, `Flashcard ${flashcardId} answered. Is Correct: ${isCorrect}`, "info");

            // Save the updated flashcard
            const modifiedCount = await flashcardStore.updateFlashcard(card);

            if (modifiedCount == 0) {
                logger.compute(cid, `Flashcard ${flashcardId} ${modifiedCount > 0 ? "updated" : "NOT UPDATED!"}`, "info");
                throw new TotoRuntimeError(500, `Flashcard ${flashcardId} was not updated after answering`); 
            }

            // Check if the Practice is finished
            const finished = await flashcardStore.countUnansweredFlashcards(practiceId) == 0;

            logger.compute(cid, `Practice ${practiceId} is ${finished ? "finished" : "not finished"}`, "info");

            // If the practice is finished, update the practice with the score
            if (finished) {

                // Find the practice and update it with the score
                const practiceStore = new PracticeStore(db, config);

                const practice = await practiceStore.findPractice(practiceId);

                // Get all the flashcards for the practice
                const flashcards = await flashcardStore.getPracticeFlashcards(practiceId);

                // Compute the Score
                const score = computePracticeScore(flashcards)

                // Compute the Practice Statistics
                const stats = computePracticeStatistics(flashcards);

                // Close the practice and Compute the score
                practice.closePractice(score, stats);

                // Update the practice in the DB
                await practiceStore.updatePractice(practice);

                logger.compute(cid, `Practice ${practiceId} closed at ${practice.finishedOn} with score ${practice.score}`, "info");

                // TODO Publish an event on PubSub
                await new EventPublisher(execContext, "tomepractices").publishEvent(practice.id!, EVENTS.practiceFinished, `Practice ${practice.id} has finished`, practice)

                return {
                    isCorrect: isCorrect,
                    finished: true, 
                    score: practice.score, 
                    stats: practice.stats
                }
            }

            // Return result 
            return { 
                isCorrect: isCorrect, 
                finished: false, 
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