import { Db, ObjectId } from "mongodb"

const runtimeConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    const queryParams = await getQuery(event)
    const missionid = event.context.params?.id
    
    if (!missionid) {
        return createError('Id required')
    }

    const dbClient: Db = event.context.db

    const result = await dbClient.collection<Mission>(runtimeConfig.MONGO_COLLECTION).updateOne(
        { _id: new ObjectId(missionid) },
        { $set: { "missionIsPlayable.val": true } },
        { upsert: false }
    )

    return
})