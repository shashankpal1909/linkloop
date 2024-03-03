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
import { followAcceptRouter } from "./routes/follow/accept";
import { followRejectRouter } from "./routes/follow/reject";
import { followRequestRouter } from "./routes/follow/request";
import { showProfileRouter } from "./routes/profile/show";

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
app.use(showProfileRouter);
app.use(followAcceptRouter);
app.use(followRejectRouter);
app.use(followRequestRouter);

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
