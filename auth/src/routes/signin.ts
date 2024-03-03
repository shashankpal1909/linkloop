import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@linkloop/common";

import { User } from "../models/user";
import { Password } from "../services/password";

// Create an Express router
const router = express.Router();

/**
 * Route handler for user sign-in.
 * Validates user input, checks credentials, generates a JWT, and sets it in the session.
 */
router.post(
  "/api/auth/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must enter a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid Login Credentials");
    }

    // Compare passwords
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Login Credentials");
    }

    // Generate a JWT (JSON Web Token)
    const userJWT = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // Store the JWT on the session object
    req.session = { jwt: userJWT };

    // Send a successful response
    res.status(200).send(existingUser);
  }
);

// Export the router
export { router as signInRouter };
