import express, { Request, Response } from "express";

import { NotFoundError } from "@linkloop/common";

import { Profile, ProfileDoc } from "../../models/profile";

// Create an Express router
const router = express.Router();

/**
 * Route handler for retrieving a user profile.
 */
router.get("/api/profile/:slug", async (req: Request, res: Response) => {
  let profile: ProfileDoc | null;

  // Find the profile by ID or username
  try {
    profile = await Profile.findById(req.params.slug);
  } catch (error) {
    profile = await Profile.findOne({ userName: req.params.slug });
  }

  // If profile not found, throw a "Not Found" error
  if (!profile) {
    throw new NotFoundError();
  }

  // Send the profile data as the response
  res.send(profile);
});

// Export the router
export { router as showProfileRouter };
