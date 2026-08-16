import redis from "./redisClient";

const ALPHA = 0.1;
const Z_THRESHOLD = 3;
const MIN_VARIANCE = 0.01;
const MIN_WARMUP_WINDOWS = 10;


interface EwmaState{
    mean: number;
    variance: number;
    windowsSeen: number;
}
// Function to get the generate the state key
function getStateKey(projectId: string, service: string): string {
   return `ewma:${projectId}:${service}`;
};

// Function to get the state 
async function getState(projectId: string, service: string): Promise<EwmaState>{
     const raw = await redis.get(getStateKey(projectId, service));
     if(!raw){
        return {mean: 0, variance: MIN_VARIANCE, windowsSeen: 0};
     }
     return JSON.parse(raw) as EwmaState;
}

// Function to save the state
async function saveState(projectId: string, service: string, state: EwmaState): Promise<void>{
    await redis.set(getStateKey(projectId, service), JSON.stringify(state));
}


export interface windowResult{
    zScore : number;
    isAnomaly: boolean;
    errorCount: number;
    mean: number;
};

export async function processMinutesWindow(
 projectId: string,
 service: string,
 errorCount: number
):Promise<windowResult>{
    const state = await getState(projectId, service);
    const oldMean = state.mean;
    const oldStd = Math.sqrt(state.variance);
    const zScore =oldStd > 0 ? (errorCount-oldMean)/oldStd: 0;

    const diff = errorCount-state.mean;
    const newMean = state.mean + ALPHA*diff;
    const newVariance = Math.max(MIN_VARIANCE,(1-ALPHA)*(state.variance+ ALPHA*diff*diff));
    const newState: EwmaState = {
        mean: newMean,
        variance: newVariance,
        windowsSeen: state.windowsSeen+1,
    };

    await saveState(projectId, service, newState);
    
    const isAnomaly = newState.windowsSeen > MIN_WARMUP_WINDOWS && zScore > Z_THRESHOLD;

     return {zScore,isAnomaly,errorCount,mean:newMean};
}
