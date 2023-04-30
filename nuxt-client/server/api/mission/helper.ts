import { WithId } from "mongodb";

export default function finalizeMissionType(missionList: WithId<Mission> | WithId<Mission>[]): Mission[] {
    const finalizedDatas: Mission[] = [];

    if (Array.isArray(missionList)) {
        missionList.forEach((elem) => {
            elem.missionId = elem._id.toString();
            finalizedDatas.push(elem);
        });
    } else {
        missionList.missionId = missionList._id.toString();
        finalizedDatas.push(missionList);
    }

    return finalizedDatas;
}