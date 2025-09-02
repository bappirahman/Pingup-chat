// Use the same import for both createClient and RedisClientType, and specify the generic parameter
import { createClient, type RedisClientType } from "redis";

export let redisClient: RedisClientType<Record<string, never>>;

const redisConnect = async (
  redisURL: string
): Promise<RedisClientType<Record<string, never>>> => {
  if (!redisURL) throw new Error("Redis URL is not defined");
  const client = createClient({
    url: redisURL,
  });
  redisClient = client as RedisClientType<Record<string, never>>;
  client.on("error", function (err) {
    throw err;
  });
  await client.connect();
  if (client.isOpen) {
    console.log("Redis connected");
  }
  return client as RedisClientType<Record<string, never>>;
};

export default redisConnect;
