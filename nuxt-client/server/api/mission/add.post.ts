import { Db } from 'mongodb'
import finalizeMissionType from './helper';

const { MONGO_COLLECTION } = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(body);
})
