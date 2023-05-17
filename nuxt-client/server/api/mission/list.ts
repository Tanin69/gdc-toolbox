import { Db } from 'mongodb'
import finalizeMissionType from './helper'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const dbClient: Db = event.context.db
  const collection = dbClient.collection<Mission>(
    runtimeConfig.MONGO_COLLECTION
  )
  const datas = await collection.find().toArray()
  return finalizeMissionType(datas)
})
