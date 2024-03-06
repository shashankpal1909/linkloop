import express, { Request, Response } from "express";

import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@linkloop/common";

import { Follow, FollowDoc, FollowStatus } from "../../models/follow";
import { Profile } from "../../models/profile";

// Create an Express router
const router = express.Router();

/**
 * Route handler for accepting a follow request.
 */
router.post(
  "/api/profile/follow/:followId/accept",
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    let follow: FollowDoc | null;

    try {
      // Find the follow request by ID
      follow = await Follow.findById(req.params.followId);
    } catch (error) {
      follow = null;
    }

    // If follow request not found, throw a "Not Found" error
    if (!follow) {
      throw new NotFoundError();
    }

    // If the current user is not the recipient of the follow request, throw an "Unauthorized" error
    if (follow.to !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // If follow request is not pending, throw a "Bad Request" error
    if (follow.status !== FollowStatus.Pending) {
      throw new BadRequestError("Follow request already approved/rejected");
    }

    // Approve the follow request
    follow.status = FollowStatus.Accepted;
    await follow.save();

    // Get the profiles involved in the follow request
    const from = await Profile.findById(follow.from);
    const to = await Profile.findById(follow.to);

    if (!from || !to) {
      throw new NotFoundError();
    }

    // Update following count for `from` profile
    from.following++;
    await from.save();

    // Update followers count for `to` profile
    to.followers++;
    await to.save();

    // Send the updated follow request as the response
    res.send(follow);
  }
);

// Export the router
export { router as followAcceptRouter };
