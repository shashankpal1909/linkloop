/**
 * Import dependencies
 */
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";
import express from "express";

import { errorHandler, NotFoundError } from "@linkloop/common";

/**
 * Import routes
 */
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";

/**
 * Initialize the express app
 */
const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

/**
 * Mount routes
 */
app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);

/**
 * Define 404 Not Found handler
 */
app.all("*", async (req, res) => {
  throw new NotFoundError();
});

/**
 * Error handling middleware
 */
app.use(errorHandler);

/**
 * Export the app
 */
export { app };
