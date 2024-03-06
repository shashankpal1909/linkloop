/**
 * Import dependencies
 */
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";
import express from "express";
import morgan from "morgan";

import { currentUser, errorHandler, NotFoundError } from "@linkloop/common";

/**
 * Import routes
 */
import { followAcceptRouter } from "./routes/follow/accept";
import { followRejectRouter } from "./routes/follow/reject";
import { followRemoveRouter } from "./routes/follow/remove";
import { followRequestRouter } from "./routes/follow/request";
import { uploadProfilePictureRouter } from "./routes/profile/picture/add";
import { showProfileRouter } from "./routes/profile/show";
import { updateProfileRouter } from "./routes/profile/update";

/**
 * Initialize the express app
 */
const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(morgan("dev"));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

/**
 * Mount routes
 */
app.use(showProfileRouter);
app.use(updateProfileRouter);

app.use(followRequestRouter);
app.use(followRemoveRouter);
app.use(followAcceptRouter);
app.use(followRejectRouter);

app.use(uploadProfilePictureRouter);

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
