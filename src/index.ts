import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostPractice } from "./dlg/PostPractice";
import { DeletePractice } from "./dlg/DeletePractice";

const api = new TotoAPIController("tome-ms-practice", new ControllerConfig())

api.path('POST', '/practices', new PostPractice())
api.path('DELETE', '/practices/:practiceId', new DeletePractice())

api.init().then(() => {
    api.listen()
});