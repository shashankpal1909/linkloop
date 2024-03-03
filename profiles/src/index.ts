import mongoose from "mongoose";

import { amqpWrapper } from "./amqp-wrapper";
import { app } from "./app";
import { UserCreatedListener } from "./events/listeners/user-created-listener";

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

  try {
    await amqpWrapper.connect(process.env.AMQP_URL);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

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
