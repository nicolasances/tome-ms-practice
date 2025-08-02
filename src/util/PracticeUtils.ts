import { PracticeStats } from "../model/Practice";
import { PracticeFlashcard } from "../model/PracticeFlashcard";

/**
 * Computes the score. 
 * 
 * The score is calculated as the proportion between the number of questions where there was at least one wrong answer and the total number of questions. 
 * 
 * @param flashcards the flashcards of the practice
 */
export function computePracticeScore(flashcards: PracticeFlashcard[]): number {

    if (flashcards.length === 0) return 0;

    const questionsWithWrongAnswers = flashcards.filter(fc => fc.numWrongAnswers && fc.numWrongAnswers > 0).length;

    // Compute the total number of questions. This has to be done because graphs are a single flashcard, but they have multiple questions.
    const countQuestions = (fc: PracticeFlashcard): number => {

        if (fc.originalFlashcard.type === 'graph') {

            // Traverse the graph, starting with firstEvent and then going through each nextEvent
            let count = 0;

            const traverseEventGraph = (event: any | null): void => {

                if (!event) return;

                count++;
                if (event.date) count++;

                traverseEventGraph(event.nextEvent);
            };

            traverseEventGraph((fc.originalFlashcard as any).graph.eventGraph.firstEvent);

            return count;
        }
        
        return 1;
    }
    const totalQuestions = flashcards.reduce((sum, fc) => sum + (countQuestions(fc)), 0);

    if (totalQuestions - questionsWithWrongAnswers <= 0) return 0;

    return ((totalQuestions - questionsWithWrongAnswers) / totalQuestions) * 100;

}

/**
 * Computes the pracice stats after it was completed. 
 * 
 * - averageAttempts is calculated as the average of the number of wrong answers across all questions
 * - totalWrongAnswers is calculated as the sum of the number of wrong answers across all questions
 * - numCards is the number of flashcards
 * 
 * @param flashcards the flashcards of the practice
 */
export function computePracticeStatistics(flashcards: PracticeFlashcard[]): PracticeStats {

    const numCards = flashcards.length;

    const totalWrongAnswers = flashcards.reduce((sum, fc) => sum + (fc.numWrongAnswers || 0), 0);

    const averageAttempts = numCards === 0 ? 0 : totalWrongAnswers / numCards;

    return {
        averageAttempts,
        totalWrongAnswers,
        numCards
    };

}