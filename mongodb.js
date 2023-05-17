var mongo = require("mongodb");
var mongoose = require("mongoose");

let mongo = null;
let database = null;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local')
}

export async function connectToDatabase() {
    try {
        if (mongo && database) {
            return { mongo, database };
        }
        if (process.env.NODE_ENV === "development") {
            if (!global._mongo) {
                mongo = await (new mongo(uri, options)).connect();
                global._mongo = mongo;
            } else {
                mongo = global._mongo;
            }
        } else {
            mongo = await (new mongo(uri, options)).connect();
        }
        database = await mongo.db(process.env.MONGODB_DATABASE);
        return { mongo, database };
    } catch (e) {
        console.error(e);
    }
}

