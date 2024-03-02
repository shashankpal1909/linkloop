import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";
import express from "express";

import { errorHandler, NotFoundError } from "@linkloop/common";

import { followAcceptRouter, followRejectRouter, followRequestRouter } from "./routes/follow";
import { showProfileRouter } from "./routes/get-profile";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(showProfileRouter);
app.use(followRequestRouter);
app.use(followAcceptRouter);
app.use(followRejectRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
