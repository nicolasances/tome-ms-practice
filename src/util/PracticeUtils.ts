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

    return ((flashcards.length - questionsWithWrongAnswers) / flashcards.length) * 100;

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