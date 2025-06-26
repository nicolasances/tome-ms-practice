import { Db, ObjectId } from "mongodb";
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
     * Finds a specific practice
     * 
     * @param practiceId the id
     * @returns the found practice
     */
    async findPractice(practiceId: string): Promise<Practice> {

        const practice = await this.db.collection(this.practiceCollection).findOne({ _id: new ObjectId(practiceId) })

        return Practice.fromBSON(practice);

    }

    /**
     * Finds all practices for a given topic
     * 
     * @param topicId the topic id to search for practices
     * @returns a list of practices for the given topic
     */
    async findPracticesByTopic(topicId: string, onlyFinished: boolean = false): Promise<Practice[]> {

        const filter: any = {
            topicId: topicId
        }

        if (onlyFinished) filter['finishedOn'] = { $exists: true, $ne: null };
        
        const practices = await this.db.collection(this.practiceCollection).find(filter).toArray();

        return practices.map(practice => Practice.fromBSON(practice));
    }

    /**
     * Updates a specific practice
     * 
     * @param practice the practice to update
     * @returns the count of updated practices
     */
    async updatePractice(practice: Practice): Promise<number> {

        const result = await this.db.collection(this.practiceCollection).updateOne(
            { _id: new ObjectId(practice.id) },
            { $set: practice.toBSON() }
        );

        return result.modifiedCount;
    }


    /**
     * Deletes a specific practice
     * 
     * @param practiceId the id
     * @returns the count
     */
    async deletePractice(practiceId: string): Promise<number> {

        const result = await this.db.collection(this.practiceCollection).deleteOne({ _id: new ObjectId(practiceId) })

        return result.deletedCount;
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

    /**
     * Finds and returns the last finished practice for a given topic
     * 
     * @param topicId the topic id to search for
     * @returns the latest finished practice for the given topic, or null if none exists
     */
    async findLastFinishedPractice(topicId: string): Promise<Practice | null> {

        const doc = await this.db.collection(this.practiceCollection).findOne({
            topicId,
            $and: [
                {finishedOn: { $exists: true }}, 
                {finishedOn: { $ne: null }}
            ]
        }, { sort: { finishedOn: -1 } });

        if (!doc) return null;

        return Practice.fromBSON(doc);
    }

}