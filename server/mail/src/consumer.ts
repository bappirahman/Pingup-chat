import nodemailer from "nodemailer";
import "dotenv/config";
import amqp from "amqplib";

interface rabbitConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
}

interface smtpConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
}

interface OtpConsumerOptions {
  fromEmail: string;
  rabbitConfig: rabbitConfig;
  smtpConfig: smtpConfig;
}

const startSendOtpConsumer = async ({
  fromEmail,
  rabbitConfig,
  smtpConfig,
}: OtpConsumerOptions) => {
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
    console.log(
      "Starting OTP mail consumer with RabbitMQ and SMTP configuration..."
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

    // For development: purge old messages from queue
    // if (process.env.NODE_ENV !== "production") {
    //   await channel.purgeQueue(queueName);
    //   console.log(`Purged queue "${queueName}" for development`);
    // }

    console.log(
      `RabbitMQ consumer is listening for OTP emails on queue "${queueName}" at ${rabbitConfig.host}:${rabbitConfig.port}`
    );
    channel.consume(queueName, async (message) => {
      if (!message) {
        throw new Error(
          "Received null or undefined message from RabbitMQ queue. Cannot process OTP email."
        );
      }
      try {
        const { to, subject, body } = JSON.parse(message.content.toString());
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: Number(smtpConfig.port),
          auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password,
          },
        });
        console.log(`to: ${to}, subject: ${subject}, body: ${body}`);

        const { messageId, rejected } = await transporter.sendMail({
          from: fromEmail,
          to,
          subject,
          text: body,
        });
        if (!messageId) {
          throw new Error(
            `Failed to send OTP email to ${to}. Message was not accepted by the SMTP server. Rejected recipients: ${
              Array.isArray(rejected) && rejected.length > 0
                ? rejected.join(", ")
                : "none"
            }`
          );
        }
        console.log(`OTP email sent to ${to} with subject "${subject}"`);
        channel.ack(message);
      } catch (error) {
        console.error(
          "Failed to parse OTP email message from RabbitMQ queue: " +
            (error instanceof Error ? error.message : String(error))
        );
        channel.nack(message, false, false);
      }
    });
  } catch (error) {
    console.error(
      "Failed to start mail OTP consumer:",
      error instanceof Error ? error.message : error
    );
  }
};

export default startSendOtpConsumer;
