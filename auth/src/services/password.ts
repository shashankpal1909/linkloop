import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Utility class for handling password-related operations.
 */
export class Password {
  /**
   * Hashes a password using a salt.
   *
   * @param password - The plain text password to hash
   * @returns A string containing the hashed password and salt
   */
  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString("hex");
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buff.toString("hex")}.${salt}`;
  }

  /**
   * Compares a stored hashed password with a supplied plain text password.
   *
   * @param storedPassword - The stored hashed password (including salt)
   * @param suppliedPassword - The plain text password to compare
   * @returns `true` if the passwords match, otherwise `false`
   */
  static async compare(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buff = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buff.toString("hex") === hashedPassword;
  }
}
