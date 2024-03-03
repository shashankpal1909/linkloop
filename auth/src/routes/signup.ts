import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@linkloop/common";

import { amqpWrapper } from "../amqp-wrapper";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { User } from "../models/user";

// Create an Express router
const router = express.Router();

/**
 * Route handler for user sign-up.
 * Validates user input, checks for existing users, creates a new user,
 * generates a JSON Web Token (JWT), and publishes a user-created event.
 */
router.post(
  "/api/auth/signup",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("fullName").trim().not().isEmpty().withMessage("Invalid Name"),
    body("userName")
      .trim()
      .isLength({ min: 4, max: 32 })
      .withMessage("Invalid Username"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, fullName, userName } = req.body;

    // Check if email is already in use
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    // Check if username is already in use
    existingUser = await User.findOne({ userName });
    if (existingUser) {
      throw new BadRequestError("Username already in use");
    }

    // Create a new user
    const user = User.build({ email, password, fullName, userName });
    await user.save();

    // Generate a JWT (JSON Web Token)
    const userJWT = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY!
    );

    // Store the JWT on the session object
    req.session = { jwt: userJWT };

    // Publish a user-created event
    new UserCreatedPublisher(
      amqpWrapper.connection,
      amqpWrapper.channel
    ).publish({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
    });

    // Send a successful response
    res.status(201).send(user);
  }
);

// Export the router
export { router as signUpRouter };
