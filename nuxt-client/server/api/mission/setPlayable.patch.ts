import { Db, ObjectId } from "mongodb"

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {

    const parsedBody = await readBody(event)

    if (!parsedBody.missionId) {
        return createError('Id required')
    }

    if (parsedBody.isPlayable === undefined || parsedBody.isPlayable === null) {
        return createError('isPlayable required')
    }

    const dbClient: Db = event.context.db

    const result = await dbClient.collection<Mission>(runtimeConfig.MONGO_COLLECTION).updateOne(
        { _id: new ObjectId(parsedBody.missionId) },
        { $set: { "missionIsPlayable.val": parsedBody.isPlayable } },
        { upsert: false }
    )

    setResponseStatus(event, 200, "Mission marked as playable")
})