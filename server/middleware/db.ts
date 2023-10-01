import { MongoClient } from 'mongodb'

const runtimeConfig = useRuntimeConfig()
const dbClient = new MongoClient(runtimeConfig.MONGO_URL)

export default defineEventHandler(async (event) => {
  await dbClient.connect()
  event.context.db = dbClient.db(runtimeConfig.MONGO_NAME)
})
