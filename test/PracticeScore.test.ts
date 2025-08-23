import { expect } from "chai";
import { computePracticeScore } from "../src/util/PracticeUtils";

// Mock PracticeFlashcard type
type PracticeFlashcard = {
  numWrongAnswers?: number;
  originalFlashcard: {
    type: string;
    graph?: {
      eventGraph: {
        firstEvent: any;
      }
    }
  }
};

// Helper to create a graph flashcard with a given number of events
function createGraphFlashcard( numEvents: number, numWrongAnswers: number, numDates: number = numEvents): PracticeFlashcard {

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
    expect(computePracticeScore([])).to.equal(0);
  });

  it("returns 100 when all answers are correct", () => {
    const flashcards = [
      { numWrongAnswers: 0, originalFlashcard: { type: "basic" } },
      { numWrongAnswers: 0, originalFlashcard: { type: "basic" } }
    ];
    expect(computePracticeScore(flashcards as any)).to.equal(100);
  });

  it("returns 0 when all answers are wrong", () => {
    const flashcards = [
      { numWrongAnswers: 1, originalFlashcard: { type: "basic" } },
      { numWrongAnswers: 2, originalFlashcard: { type: "basic" } }
    ];
    expect(computePracticeScore(flashcards as any)).to.equal(0);
  });

  it("handles a mix of correct and wrong answers", () => {
    const flashcards = [
      { numWrongAnswers: 1, originalFlashcard: { type: "basic" } },
      { numWrongAnswers: 0, originalFlashcard: { type: "basic" } }
    ];
    expect(computePracticeScore(flashcards as any)).to.equal(50);
  });

  it("handles graph flashcards with multiple questions", () => {
    const graphCard = createGraphFlashcard(3, 1); // 3 questions, 3 dates, 1 wrong
    const basicCard = { numWrongAnswers: 0, originalFlashcard: { type: "basic" } };
    // totalQuestions = 3 (graph) + 3 (graph-dates) + 1 (basic) = 7, questionsWithWrongAnswers = 1
    expect(computePracticeScore([graphCard, basicCard] as any)).to.equal(86);
  });

  it("handles graph flashcards with no wrong answers", () => {
    const graphCard = createGraphFlashcard(3, 0); // 3 questions, 0 wrong
    const basicCard = { numWrongAnswers: 0, originalFlashcard: { type: "basic" } };
    // totalQuestions = 3 (graph) + 1 (basic) = 4, questionsWithWrongAnswers = 0
    expect(computePracticeScore([graphCard, basicCard] as any)).to.equal(100);
  });

  it("handles graph flashcards where all answers are wrong", () => {
    const graphCard = createGraphFlashcard(3, 3, 0); // 3 questions, 3 wrong
    // totalQuestions = 3 (graph) = 3, questionsWithWrongAnswers = 3
    expect(computePracticeScore([graphCard] as any)).to.equal(0);
  });

  it("handles mixed flashcards", () => {
    const graphCard = createGraphFlashcard(3, 3, 1); // 3 questions, 3 wrong
    const basicCard = { numWrongAnswers: 1, originalFlashcard: { type: "basic" } };
    // totalQuestions = 5, questionsWithWrongAnswers = 4
    expect(computePracticeScore([graphCard, basicCard] as any)).to.equal(20);
  });
});

