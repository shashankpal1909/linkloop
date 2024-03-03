import { Publisher, Subjects, UserCreatedEvent } from "@linkloop/common";

import { AMQP_EXCHANGE } from "../constants";

/**
 * Publisher for the user created event.
 */
export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  /**
   * Exchange name.
   */
  exchange: string = AMQP_EXCHANGE;

  /**
   * Routing key.
   */
  routingKey: Subjects.UserCreated = Subjects.UserCreated;
}
