import express, { Request, Response } from "express";

import { NotFoundError } from "@linkloop/common";

import { Profile, ProfileDoc } from "../models/profile";

const router = express.Router();

/**
 * Get a profile by its id or username.
 * @param req - Express request object.
 * @param res - Express response object.
 */
router.get("/api/profile/:slug", async (req: Request, res: Response) => {
  let profile: ProfileDoc | null;

  try {
    profile = await Profile.findById(req.params.slug);
  } catch (error) {
    profile = await Profile.findOne({ userName: req.params.slug });
  }

  if (!profile) {
    throw new NotFoundError();
  }

  res.send(profile);
});

export { router as showProfileRouter };
