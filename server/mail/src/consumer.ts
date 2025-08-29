import nodemailer from "nodemailer";
import "dotenv/config";
import amqp from "amqplib";

interface rabbitConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
}

const startSendOtpConsumer = async (rabbitConfig: rabbitConfig) => {
  try {
    if (!rabbitConfig.host)
      throw new Error("RabbitMQ configuration error: 'host' is not defined.");
    if (!rabbitConfig.port)
      throw new Error("RabbitMQ configuration error: 'port' is not defined.");
    if (!rabbitConfig.username)
      throw new Error(
        "RabbitMQ configuration error: 'username' is not defined."
      );
    if (!rabbitConfig.password)
      throw new Error(
        "RabbitMQ configuration error: 'password' is not defined."
      );

    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: rabbitConfig.host,
      port: Number(rabbitConfig.port),
      username: rabbitConfig.username,
      password: rabbitConfig.password,
    });
    const channel = await connection.createChannel();
    const queueName = "send_otp_queue";
    await channel.assertQueue(queueName, { durable: true });
    console.log(
      `RabbitMQ consumer is listening for OTP emails on queue "${queueName}" at ${rabbitConfig.host}:${rabbitConfig.port}`
    );
  } catch (error) {
    console.error(
      "Failed to start mail OTP consumer:",
      error instanceof Error ? error.message : error
    );
  }
};
