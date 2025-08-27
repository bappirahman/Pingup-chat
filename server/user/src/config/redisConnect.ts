import { createClient } from "redis";

const redisConnect = async (redisURL: string) => {
  const client = createClient({
    url: redisURL,
  });

  client.on("error", function (err) {
    throw err;
  });
  await client.connect();
  await client.set("foo", "bar");
};

export default redisConnect;
