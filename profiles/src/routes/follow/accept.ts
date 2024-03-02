import express, { Request, Response } from "express";

import {
    BadRequestError, currentUser, NotAuthorizedError, NotFoundError, validateRequest
} from "@linkloop/common";

import { Follow, FollowDoc, FollowStatus } from "../../models/follow";

/**
 * The follow accept router.
 */
const router = express.Router();

/**
 * Accepts a follow request.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
router.post(
  "/api/profile/follow/:followId/accept",
  currentUser,
  validateRequest,
  async (req: Request, res: Response) => {
    let follow: FollowDoc | null;

    try {
      follow = await Follow.findById(req.params.followId);
    } catch (error) {
      follow = null;
    }

    if (!follow) {
      throw new NotFoundError();
    }

    if (follow.to !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (follow.status !== FollowStatus.Pending) {
      throw new BadRequestError("Follow request already approved/rejected");
    }

    follow.status = FollowStatus.Accepted;
    await follow.save();

    res.send(follow);
  }
);

export { router as followAcceptRouter };
