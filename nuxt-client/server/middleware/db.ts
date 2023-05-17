import { Db, MongoClient } from 'mongodb'

const { MONGO_URL, MONGO_NAME } = useRuntimeConfig()
const dbClient = new MongoClient(MONGO_URL)

export default defineEventHandler(async (event) => {
  await dbClient.connect()
  event.context.db = dbClient.db(MONGO_NAME)
})
