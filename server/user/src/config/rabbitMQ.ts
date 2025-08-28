import * as amqp from "amqplib";

let channel: amqp.Channel;

interface rabbitConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
}

export const connectRabbitMQ = async (rabbitConfig: rabbitConfig) => {
  try {
    if (rabbitConfig.host === undefined)
      throw new Error("RabbitMQ host is not defined");
    if (rabbitConfig.port === undefined)
      throw new Error("RabbitMQ port is not defined");
    if (rabbitConfig.username === undefined)
      throw new Error("RabbitMQ username is not defined");
    if (rabbitConfig.password === undefined)
      throw new Error("RabbitMQ password is not defined");
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: rabbitConfig.host,
      port: Number(rabbitConfig.port),
      username: rabbitConfig.username,
      password: rabbitConfig.password,
    });
    channel = await connection.createChannel();
    if (Object.keys(channel).length > 0) {
      console.log("RabbitMQ is connected");
      return true;
    }
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    throw new Error("Channel is not created");
    return false;
  }
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export default connectRabbitMQ;
