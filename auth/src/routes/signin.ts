import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@linkloop/common";

import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/auth/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must enter a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid Login Credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Login Credentials");
    }

    // Generate a JWT
    const userJWT = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = { jwt: userJWT };

    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
