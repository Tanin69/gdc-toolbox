import { Db, ObjectId } from 'mongodb'

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const missionId: string | undefined = event.context.params?.id
  if (!missionId) {
    throw createError('Mission id is required')
  }

  const parsedBody = await readBody(event)

  if (parsedBody.isPlayable == null) {
    return createError('isPlayable required')
  }

  const dbClient: Db = event.context.db

  const result = await dbClient
    .collection<Mission>(runtimeConfig.MONGO_COLLECTION)
    .updateOne(
      { _id: new ObjectId(missionId) },
      { $set: { 'missionIsPlayable.val': parsedBody.isPlayable } },
      { upsert: false }
    )

  return {
    isSuccess: true,
  }
})
