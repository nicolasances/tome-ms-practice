import { Db } from "mongodb";
import { ControllerConfig } from "../Config";
import { Practice } from "../model/Practice";

export class PracticeStore {

    db: Db;
    practiceCollection: string;

    constructor(db: Db, config: ControllerConfig) {
        this.db = db;
        this.practiceCollection = config.getCollections().practices;
    }

    /**
     * Saves a new practice
     * 
     * @param practice the practice to save
     * @returns the inserted id
     */
    async savePractice(practice: Practice): Promise<string> {

        const result = await this.db.collection(this.practiceCollection).insertOne(practice.toBSON());

        return result.insertedId.toHexString();

    }

    /**
     * Finds an unfinished practice on the given topic, if any exists
     * 
     * @param topicId the topic on which to check
     * @returns the ongoing practice on the topic or null if none is ongoing
     */
    async findUnfinishedPractice(topicId: string): Promise<Practice | null> {

        const doc = await this.db.collection(this.practiceCollection).findOne({
            topicId,
            $or: [
                { finishedOn: null },
                { finishedOn: { $exists: false } }
            ]
        })

        if (!doc) return null;

        return Practice.fromBSON(doc)
    }

}