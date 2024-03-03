import express, { Request, Response } from "express";

import {
    BadRequestError, currentUser, NotAuthorizedError, NotFoundError, validateRequest
} from "@linkloop/common";

import { Follow, FollowDoc, FollowStatus } from "../../models/follow";

// Create an Express router
const router = express.Router();

/**
 * Route handler for accepting a follow request.
 */
router.post(
  "/api/profile/follow/:followId/accept",
  currentUser,
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

    // Send the updated follow request as the response
    res.send(follow);
  }
);

// Export the router
export { router as followAcceptRouter };
