import { Db } from 'mongodb'

const { MONGO_COLLECTION } = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const dbClient: Db = event.context.db
  const collection = dbClient.collection<Mission>(MONGO_COLLECTION)
  const datas = await collection.find().toArray()
  return datas
})
