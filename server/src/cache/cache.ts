import Redis from "ioredis";

export const initializeCache = async (): Promise<Redis.Redis> => {
  const cache = new Redis(process.env.REDIS_URL);
  console.log(`Redis status: ${cache.status}`);

  // TODO: Figure out why status always is 'connecting'
  if (cache.status === "connecting") console.log("Server is already connecting to Redis cache.");
  else {
    try {
      await cache.connect();
      console.log("Server is connected to Redis cache.");
    } catch (e) {
      console.error(e);
    }
  }

  //Capture app termination/restart events
  //To be called when process is restarted or terminated
  const disconnect = (msg: string) => {
    cache.disconnect(false);
    console.log(`Cache status: ${cache.status}`);
    console.log("Redis client disconnected through " + msg);
  };

  //For app termination
  process.on("SIGINT", () => {
    disconnect("app termination");
  });
  //For Heroku app termination
  process.on("SIGTERM", () => {
    disconnect("Heroku app termination");
  });

  return cache;
};
