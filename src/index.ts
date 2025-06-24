import { TotoAPIController } from "toto-api-controller";
import { ControllerConfig } from "./Config";
import { PostPractice } from "./dlg/PostPractice";

const api = new TotoAPIController("tome-ms-practice", new ControllerConfig())

api.path('POST', '/practices', new PostPractice())

api.init().then(() => {
    api.listen()
});