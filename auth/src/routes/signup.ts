import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { BadRequestError, validateRequest } from "@linkloop/common";

import { amqpWrapper } from "../amqp-wrapper";
import { UserCreatedPublisher } from "../events/publishers/user-created-publisher";
import { User } from "../models/user";

const router = express.Router();

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

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email already in use");
    }

    existingUser = await User.findOne({ userName });

    if (existingUser) {
      throw new BadRequestError("Username already in use");
    }

    const user = User.build({ email, password, fullName, userName });
    await user.save();

    // Generate a JWT
    const userJWT = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY!
    );
    debugger;
    // Store it on session object
    req.session = { jwt: userJWT };

    new UserCreatedPublisher(
      amqpWrapper.connection,
      amqpWrapper.channel
    ).publish({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
    });

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
