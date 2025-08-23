
import http from "request";
import { ExecutionContext } from "toto-api-controller/dist/model/ExecutionContext";
import { ControllerConfig } from "../Config";

export class FlashcardsAPI {

    endpoint: string;
    cid: string | undefined;
    authHeader: string;

    constructor(execContext: ExecutionContext, authHeader: string) {
        this.endpoint = (execContext.config as ControllerConfig).getAPIsEndpoints().flashcards;
        this.cid = execContext.cid;
        this.authHeader = authHeader;
    }

    async getFlashcards(topicId: string): Promise<GetFlashcardsResponse> {

        return await new Promise<GetFlashcardsResponse>((resolve, reject) => {
            http({
                uri: `${this.endpoint}/flashcards?topicId=${topicId}`,
                method: 'GET',
                headers: {
                    'x-correlation-id': this.cid,
                    'Authorization': this.authHeader
                }
            }, (err: any, resp: any, body: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }
}

type Flashcard = MultipleOptionsFlashcard | SectionTimelineFlashcard;

export interface GetFlashcardsResponse {

    flashcards: Flashcard[];

}

export interface MultipleOptionsFlashcard {
    
    id?: string;
    type: string;
    user: string;
    topicId: string;
    topicCode: string;
    question: string;
    options: string[];
    rightAnswerIndex: number;
    sectionShortTitle: string;
}
export interface SectionTimelineFlashcard {
    id?: string;
    type: string;
    user: string;
    topicId: string;
    topicCode: string;
    sectionTitle: string;
    sectionShortTitle: string;
    events: SectionTimelineEvent[];
}

export interface HistoricalGraphFlashcard {
    id?: string | undefined;
    type: string;
    topicId: string;
    topicCode: string;
    sectionCode: string;
    sectionIndex: number;   // 0-based index of the section in the topic to manage proper ordering
    user: string;

    sectionTitle: string;
    sectionShortTitle: string;

    // Fields specific to Historical Graphs
    graph: {
        summary: string;
        eventGraph: {
            firstEvent: EventNode;
        };
        facts: Fact[];
    };

}


interface EventNode {
    code: string; // Unique code for the event
    event: string;
    reason: string | null; // Reason for the event, if mentioned
    date: string | null; // Date in a specific format
    dateFormat: string | null; // e.g. "YYYY-MM-DD", "MM-DD", "DD-MM"
    nextEvent: EventNode | null;
    question: string;
    answers: string[]; // Array of answers, only one is correct
    correctAnswerIndex: number; // Index of the correct answer in the answers array
    link?: "causal" | "chronological"; // Link type with the previous event in the graph, if applicable
}

interface Fact {
    fact: string;
    eventCode: string | null; // Code of the event this fact is connected to, or null if not related to any event
    linkReason: string | null; // Reason for the link to the specified event, if applicable
}


export interface SectionTimelineEvent {

    event: string;
    date: string;
    dateFormat: string;
    real: boolean;
    order: number;

}