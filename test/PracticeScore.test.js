"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const PracticeUtils_1 = require("../src/util/PracticeUtils");
// Helper to create a graph flashcard with a given number of events
function createGraphFlashcard(numEvents, numWrongAnswers, numDates = numEvents) {
    // Create a linked list of events, with numDates events having a date
    let event = null;
    for (let i = numEvents - 1; i >= 0; i--) {
        event = {
            nextEvent: event,
            date: i < numDates ? "2020" : undefined
        };
    }
    return {
        numWrongAnswers,
        originalFlashcard: {
            type: "graph",
            graph: {
                eventGraph: {
                    firstEvent: event
                }
            }
        }
    };
}
describe("computePracticeScore", () => {
    it("returns 0 for empty flashcards", () => {
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)([])).to.equal(0);
    });
    it("returns 100 when all answers are correct", () => {
        const flashcards = [
            { numWrongAnswers: 0, originalFlashcard: { type: "basic" } },
            { numWrongAnswers: 0, originalFlashcard: { type: "basic" } }
        ];
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)(flashcards)).to.equal(100);
    });
    it("returns 0 when all answers are wrong", () => {
        const flashcards = [
            { numWrongAnswers: 1, originalFlashcard: { type: "basic" } },
            { numWrongAnswers: 2, originalFlashcard: { type: "basic" } }
        ];
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)(flashcards)).to.equal(0);
    });
    it("handles a mix of correct and wrong answers", () => {
        const flashcards = [
            { numWrongAnswers: 1, originalFlashcard: { type: "basic" } },
            { numWrongAnswers: 0, originalFlashcard: { type: "basic" } }
        ];
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)(flashcards)).to.equal(50);
    });
    it("handles graph flashcards with multiple questions", () => {
        const graphCard = createGraphFlashcard(3, 1); // 3 questions, 3 dates, 1 wrong
        const basicCard = { numWrongAnswers: 0, originalFlashcard: { type: "basic" } };
        // totalQuestions = 3 (graph) + 3 (graph-dates) + 1 (basic) = 7, questionsWithWrongAnswers = 1
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)([graphCard, basicCard])).to.equal(86);
    });
    it("handles graph flashcards with no wrong answers", () => {
        const graphCard = createGraphFlashcard(3, 0); // 3 questions, 0 wrong
        const basicCard = { numWrongAnswers: 0, originalFlashcard: { type: "basic" } };
        // totalQuestions = 3 (graph) + 1 (basic) = 4, questionsWithWrongAnswers = 0
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)([graphCard, basicCard])).to.equal(100);
    });
    it("handles graph flashcards where all answers are wrong", () => {
        const graphCard = createGraphFlashcard(3, 3, 0); // 3 questions, 3 wrong
        // totalQuestions = 3 (graph) = 3, questionsWithWrongAnswers = 3
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)([graphCard])).to.equal(0);
    });
    it("handles mixed flashcards", () => {
        const graphCard = createGraphFlashcard(3, 3, 1); // 3 questions, 3 wrong
        const basicCard = { numWrongAnswers: 1, originalFlashcard: { type: "basic" } };
        // totalQuestions = 5, questionsWithWrongAnswers = 4
        (0, chai_1.expect)((0, PracticeUtils_1.computePracticeScore)([graphCard, basicCard])).to.equal(20);
    });
});
