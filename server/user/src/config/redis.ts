import { createClient } from "redis";

const redisConnect = async (redisURL: string) => {
  if (!redisURL) throw new Error("Redis URL is not defined");
  const client = createClient({
    url: redisURL,
  });

  client.on("error", function (err) {
    throw err;
  });
  await client.connect();
  if (client.isOpen) {
    console.log("Redis connected");
    return true;
  }
};

export default redisConnect;
