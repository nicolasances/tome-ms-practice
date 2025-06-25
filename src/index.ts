import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostPractice } from "./dlg/PostPractice";
import { DeletePractice } from "./dlg/DeletePractice";
import { GetOngoingPractice } from "./dlg/GetOngoingPractice";
import { PostAnswer } from "./dlg/PostAnswer";
import { GetPracticeFlashcards } from "./dlg/GetPracticeFlashcards";

const api = new TotoAPIController("tome-ms-practice", new ControllerConfig())

api.path('POST', '/practices', new PostPractice());
api.path('DELETE', '/practices/:practiceId', new DeletePractice());
api.path('GET', '/practices/ongoing', new GetOngoingPractice());

api.path('GET', '/practices/:practiceId/flashcards', new GetPracticeFlashcards());
api.path('POST', '/practices/:practiceId/flashcards/:flashcardId/answer', new PostAnswer());

api.init().then(() => {
    api.listen()
});