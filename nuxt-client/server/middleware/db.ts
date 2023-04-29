import { MongoClient } from "mongodb";

const {
 MONGO_URL,
 MONGO_NAME,
} = useRuntimeConfig()

export default defineEventHandler(async (event) => {
	const dbClient = new MongoClient(MONGO_URL);
	await dbClient.connect();
	event.context.db = dbClient.db(MONGO_NAME);
});
