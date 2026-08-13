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
async function gteSatae(projectId: string, service: string): Promise<EwmaState>{
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

