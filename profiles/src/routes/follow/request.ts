import express, { Request, Response } from "express";

import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@linkloop/common";

import { Follow, FollowStatus } from "../../models/follow";
import { Profile, ProfileDoc } from "../../models/profile";

// Create an Express router
const router = express.Router();

/**
 * Route handler for sending a follow request.
 */
router.post(
  "/api/profile/:slug/follow",
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

    // If trying to follow own profile, throw a "Bad Request" error
    if (profile.id === req.currentUser?.id) {
      throw new BadRequestError("You cannot follow/unfollow yourself.");
    }

    // Check if there's an existing follow relationship
    const existingFollow = await Follow.findOne({
      from: req.currentUser!.id,
      to: profile.id,
    });

    if (existingFollow) {
      // If already following, throw a "Bad Request" error
      if (existingFollow.status === FollowStatus.Accepted) {
        throw new BadRequestError("You are already following this user.");
      }

      // If follow request pending, throw a "Bad Request" error
      if (existingFollow.status === FollowStatus.Pending) {
        throw new BadRequestError(
          "You have already requested to follow this user."
        );
      }

      // If follow request rejected, throw a "Bad Request" error
      if (existingFollow.status === FollowStatus.Rejected) {
        throw new BadRequestError("Your follow request has been rejected.");
      }
    }

    // Create a new follow request
    const follow = Follow.build({
      from: req.currentUser!.id,
      to: profile.id,
    });
    await follow.save();

    // Send the follow request as the response
    res.send(follow);
  }
);

// Export the router
export { router as followRequestRouter };
