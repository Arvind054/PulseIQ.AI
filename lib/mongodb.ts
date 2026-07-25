import {MongoClient} from "mongodb";

const DB_URL = process.env.DB_URL!;

const client = new MongoClient(DB_URL);

let promise : Promise<MongoClient>;

if(process.env.NODE_ENV == "development"){
    if (!(global as any)._mongoClientPromise) {
        (global as any)._mongoClientPromise = client.connect();
    }
    promise = (global as any)._mongoClientPromise;
}else{
    promise = client.connect();
}

export default promise;