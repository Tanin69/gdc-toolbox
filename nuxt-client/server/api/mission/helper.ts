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

/**
 * 
 * @param isOk 
 * @param label 
 * @param isBlocking 
 * @returns 
 */
export function initMissionFieldError(isOk: boolean, label: string, isBlocking: boolean = false): MissionFieldError {
    return {
        isOK: isOk,
        label: label,
        isBlocking: isBlocking
    };
}

export function checkReport(report: MissionError): MissionError {
    
    let isReportValid: boolean = true;
    let blockingErrorCount: number = 0;

    Object.values(report).filter((value) => typeof value === 'object' && instanceOfMisionFieldError(value as MissionFieldError)).forEach((value) => {
        value = <MissionFieldError>value;
        if (!value.isOK) {
            isReportValid = false;
            blockingErrorCount++;
        }
    });

    report.isMissionValid = isReportValid;
    report.nbBlockingErr = blockingErrorCount;

    return report;
}

function instanceOfMisionFieldError(param: MissionFieldError): boolean {
    return 'isOK' in param && 'isBlocking' in param && 'label' in param;
}