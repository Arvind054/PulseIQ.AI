import redis from "./redisClient";

function getMinuteBucket(): number{
    return Math.floor(Date.now()/60000)
}

export async function recordErrorLog(projectId: string, service: string): Promise<void>{

    const bucket = getMinuteBucket();
    const key = `count:${projectId}:${service}:${bucket}`;
    await redis.incr(key);
    await redis.expire(key, 120);
}

export async function getAndClearCount(projectId: string, service: string, bucket: number):Promise<number>{
     const key = `count:${projectId}:${service}:${bucket}`;
     const val = await redis.get(key);
     await redis.del(key);
     return val ? parseInt(val, 10) : 0;
}