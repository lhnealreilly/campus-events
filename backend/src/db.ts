/**
 * db.ts
 * by Larry Tseng on 11/10/22
 * A client wrapper around MongoDB's MongoClient.
 */
import {
    BulkWriteOptions, DeleteOptions, DeleteResult,
    Document,
    Filter,
    FindCursor,
    FindOptions,
    InsertManyResult,
    MongoClient,
    OptionalId, UpdateFilter, UpdateResult, WithId
} from "mongodb";

const MONGO_URI = process.env["MONGO_URI"] ?? "";
console.log(`MONGO_URI: ${MONGO_URI}`);

class DatabaseConnection {
    private _client!: MongoClient;
    private static _instance: DatabaseConnection;

    private get client(): Promise<MongoClient> {
        return this._client?.connect();
    }

    constructor() {
        // Singleton pattern
        if (DatabaseConnection._instance) {
            return DatabaseConnection._instance;
        }
        DatabaseConnection._instance = this;
        
        // Setup new database connection
        this._client = new MongoClient(MONGO_URI);
    }

    // Find
    async find(db: string, collection: string, filter: Filter<Document> = {}, options?: FindOptions): Promise<FindCursor<WithId<Document>>> {
        let _db = (await this.client).db(db);
        let _collection = _db.collection(collection);
        return _collection.find(filter, options);
    }

    // Insert
    async insert(db: string, collection: string, content: OptionalId<Document>[], options?: BulkWriteOptions): Promise<InsertManyResult> {
        let _db = (await this.client).db(db);
        let _collection = _db.collection(collection);
        if (options !== undefined) {
            return _collection.insertMany(content, options);
        } else {
            return _collection.insertMany(content)
        }
    }

    // Update
    async update(db: string, collection: string, filter: Filter<Document> = {}, update: UpdateFilter<Document>): Promise<Document | UpdateResult> {
        let _db = (await this.client).db(db);
        let _collection = _db.collection(collection);
        return _collection.updateMany(filter, update);
    }

    // Delete
    async delete(db: string, collection: string, filter: Filter<Document> = {}, options?: DeleteOptions): Promise<DeleteResult> {
        let _db = (await this.client).db(db);
        let _collection = _db.collection(collection);
        if (options !== undefined) {
            return _collection.deleteMany(filter, options);
        } else {
            return _collection.deleteMany(filter);
        }
    }

    // Count
    async count(db: string, collection: string, filter: Filter<Document> = {}): Promise<number> {
        let _db = (await this.client).db(db);
        let _collection = _db.collection(collection);
        return _collection.countDocuments(filter);
    }

    async close() {
        await (await this.client).close();
    }
}

export default DatabaseConnection;
