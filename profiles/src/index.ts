import mongoose from "mongoose";

import { amqpWrapper } from "./amqp-wrapper";
import { app } from "./app";
import { UserCreatedListener } from "./events/listeners/user-created-listener";
import { minio } from "./minio-wrapper";

/**
 * Starts the application.
 *
 * @remarks
 * This function initializes the database connection, initializes the AMQP
 * connection, and listens for events.
 *
 * @throws Error if the JWT_KEY, MONGO_URI, or AMQP_URL environment variables are
 * not defined.
 */
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.AMQP_URL) {
    throw new Error("AMQP_URL must be defined");
  }
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error("MINIO_ENDPOINT must be defined");
  }
  if (!process.env.MINIO_PORT) {
    throw new Error("MINIO_PORT must be defined");
  }
  if (!process.env.MINIO_ACCESS_KEY) {
    throw new Error("MINIO_ACCESS_KEY must be defined");
  }
  if (!process.env.MINIO_SECRET_KEY) {
    throw new Error("MINIO_SECRET_KEY must be defined");
  }

  try {
    await amqpWrapper.connect(process.env.AMQP_URL);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    minio.connect(
      process.env.MINIO_ENDPOINT,
      Number(process.env.MINIO_PORT),
      true,
      process.env.MINIO_ACCESS_KEY,
      process.env.MINIO_SECRET_KEY
    );

    new UserCreatedListener(
      amqpWrapper.connection,
      amqpWrapper.channel
    ).listen();
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Listening on PORT 3000");
  });
};

start();
