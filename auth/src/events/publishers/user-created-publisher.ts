import { Publisher, Subjects, UserCreatedEvent } from "@linkloop/common";

import { AMQP_EXCHANGE } from "../constants";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  exchange: string = AMQP_EXCHANGE;
  routingKey: Subjects.UserCreated = Subjects.UserCreated;
}
