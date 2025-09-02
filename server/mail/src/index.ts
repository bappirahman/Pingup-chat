import express from "express";
import "dotenv/config";
import startSendOtpConsumer from "./consumer.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Mail service is running on port ${PORT}`);
  startSendOtpConsumer({
    fromEmail: process.env.FROM_EMAIL!,
    rabbitConfig: {
      host: process.env.RABBITMQ_HOST!,
      port: process.env.RABBITMQ_PORT!,
      username: process.env.RABBITMQ_USERNAME!,
      password: process.env.RABBITMQ_PASSWORD!,
    },
    smtpConfig: {
      host: process.env.SMTP_HOST!,
      port: process.env.SMTP_PORT!,
      username: process.env.SMTP_USERNAME!,
      password: process.env.SMTP_PASSWORD!,
    },
  });
});
