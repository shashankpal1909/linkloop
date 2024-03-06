import * as MinIO from "minio";

class MinIOWrapper {
  private _client?: MinIO.Client;

  connect(
    endPoint: string,
    port: number,
    useSSL: boolean,
    accessKey: string,
    secretKey: string
  ) {
    try {
      this._client = new MinIO.Client({
        endPoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });

      return true;
    } catch (error) {
      console.error(`Error connecting to MinIO: ${error}`);
      return false;
    }
  }

  get client() {
    if (!this._client) {
      throw new Error(
        "MinIO connection not established. Call connect() first."
      );
    }

    return this._client;
  }
}

export const minio = new MinIOWrapper();
