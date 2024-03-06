import express, { Request, Response } from "express";

import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@linkloop/common";

import { Follow } from "../../models/follow";
import { Profile, ProfileDoc } from "../../models/profile";

// Create an Express router
const router = express.Router();

/**
 * Route handler to unfollow a user.
 */
router.post(
  "/api/profile/:slug/unfollow",
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
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

    // If trying to unfollow own profile, throw a "Bad Request" error
    if (profile.id === req.currentUser?.id) {
      throw new BadRequestError("You cannot follow/unfollow yourself.");
    }

    // Check if there's an existing follow relationship
    const existingFollow = await Follow.findOne({
      from: req.currentUser!.id,
      to: profile.id,
    });

    // If not following, throw a "Bad Request" error
    if (!existingFollow) {
      throw new BadRequestError("You are not following this user.");
    }

    // Delete the follow relationship
    const result = await Follow.findByIdAndDelete(existingFollow.id);

    // Send the result as the response
    res.send(result);
  }
);

// Export the router
export { router as followRemoveRouter };
