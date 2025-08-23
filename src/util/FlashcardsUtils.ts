import { HistoricalGraphFlashcard } from "../api/FlashcardsAPI";
import { PracticeFlashcard } from "../model/PracticeFlashcard";

/**
 * Counts the number of questions in a flashcard. 
 * 
 * The number of questions are different based on the type of flashcard: 
 * - Cards of type "options" and "date" have 1 question per card
 * - Cards of type "graph" have, for each node in the graph, 1 question + 1 question if there is a date (date field)
 * 
 * @param flashcard The flashcard to count questions for.
 */
export function countQuestions(flashcard: PracticeFlashcard): number {

    switch (flashcard.originalFlashcard.type) {
        case "options":
        case "date":
            return 1;
        case "graph":
            return countQuestionsInGraph(flashcard.originalFlashcard as HistoricalGraphFlashcard);
        default:
            return 0;
    }
}

/**
 * Counts the number of questions in a "graph" flashcard. 
 * Cards of type "graph" have, for each node in the graph, 1 question + 1 question if there is a date (date field)
 * 
 * @param fc the flashcard of type graph
 */
export function countQuestionsInGraph(fc: HistoricalGraphFlashcard) {

    if (!fc || !fc.graph || !fc.graph.eventGraph || !fc.graph.eventGraph.firstEvent) return 0;

    const graph = fc.graph.eventGraph;

    let questionCount = 0;

    // First node
    if (graph.firstEvent.date) questionCount = 2;
    else questionCount = 1;

    // Subsequent nodes
    let node = graph.firstEvent.nextEvent;
    while (node) {

        if (node.date) questionCount += 2; // 1 question for the node + 1 for the date
        else questionCount += 1; // 1 question for the node

        node = node.nextEvent;
    }

    return questionCount;
}