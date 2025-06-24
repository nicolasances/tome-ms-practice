
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

export interface GetFlashcardsResponse {

    flashcards: Flashcard[]

}

export interface Flashcard {

    type: string;
    user: string;
    topicId: string; 
    topicCode: string; 
    question: string; 
    options: string[];
    rightAnswerIndex: number; 
    id?: string;
}