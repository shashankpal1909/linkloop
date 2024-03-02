import mongoose from "mongoose";

import { amqpWrapper } from "./amqp-wrapper";
import { app } from "./app";

const start = async () => {
  // process.env.JWT_KEY = "vdsf"
  // process.env.MONGO_URI = "mongodb://localhost:27017"

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    // await amqpWrapper.connect("localhost", 5672, "guest", "guest");
    await amqpWrapper.connect("rabbitmq-srv", 5672, "linkloop", "linkloop");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Listening on PORT 3000");
  });
};

start();
