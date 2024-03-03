import amqp, { Channel, Connection } from "amqplib";

/**
 * Manages an AMQP connection.
 */
class AMQPWrapper {
  private _connection?: Connection;
  private _channel?: amqp.Channel;

  /**
   * Establishes a connection to the RabbitMQ server.
   * @param url - The URL of the RabbitMQ server, including the username and password if required.
   * @returns `true` if the connection was established, or `false` if there was an error.
   */
  async connect(url: string): Promise<boolean> {
    try {
      this._connection = await amqp.connect(url);
      console.log("Connected to RabbitMQ successfully!");

      this._channel = await this._connection.createChannel();
      console.log("Channel Created!");

      await this._channel.assertExchange("linkloop.direct", "direct", {
        durable: true,
      });
      console.log("Exchange Asserted");

      return true;
    } catch (error) {
      console.error(`Error connecting to RabbitMQ: ${error}`);
      return false;
    }
  }

  /**
   * Gets the current connection to the RabbitMQ server.
   * @throws An error if the connection has not been established.
   */
  get connection(): Connection {
    if (!this._connection) {
      throw new Error(
        "RabbitMQ connection not established. Call connect() first."
      );
    }
    return this._connection;
  }

  /**
   * Gets the current channel to the RabbitMQ server.
   * @throws An error if the channel has not been created.
   */
  get channel(): Channel {
    if (!this._channel) {
      throw new Error("RabbitMQ channel not created. Call connect() first.");
    }
    return this._channel;
  }
}

/**
 * The singleton instance of the AMQPWrapper class.
 */
export const amqpWrapper = new AMQPWrapper();
