import { Message } from "amqplib";

import { Listener, Subjects, UserCreatedEvent } from "@linkloop/common";

import { Profile } from "../../models/profile";
import { AMQP_EXCHANGE, AMQP_QUEUE } from "../constants";

/**
 * A class that listens for user created events and logs the data to the console.
 */
export class UserCreatedListener extends Listener<UserCreatedEvent> {
  /**
   * The name of the queue to listen on.
   */
  queue: string = AMQP_QUEUE;

  /**
   * The name of the exchange to publish events to.
   */
  exchange: string = AMQP_EXCHANGE;

  /**
   * The routing key to use for publishing events.
   */
  routingKey: Subjects.UserCreated = Subjects.UserCreated;

  /**
   * A function that is called when a message is received on the queue.
   * @param data The data from the event.
   * @param msg The message that was received.
   */
  async onMessage(data: UserCreatedEvent["data"], msg: Message): Promise<void> {
    try {
      const existingProfile = await Profile.findOne({
        userName: data.userName,
      });

      if (existingProfile) {
        throw new Error("User already exists");
      }

      const profile = Profile.build({
        id: data.id,
        email: data.email,
        userName: data.userName,
        fullName: data.fullName,
      });
      await profile.save();

      this.channel.ack(msg);
    } catch (error) {
      console.log(`Error processing message`, error);
      this.channel.nack(msg);
    }
  }
}
