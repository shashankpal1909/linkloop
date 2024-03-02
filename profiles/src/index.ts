import mongoose from "mongoose";

import { amqpWrapper } from "./amqp-wrapper";
import { app } from "./app";
import { UserCreatedListener } from "./events/listeners/user-created-listener";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await amqpWrapper.connect("rabbitmq-srv", 5672, "linkloop", "linkloop");

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
