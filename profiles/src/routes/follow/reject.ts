import express, { Request, Response } from "express";

import {
    BadRequestError, currentUser, NotAuthorizedError, NotFoundError, validateRequest
} from "@linkloop/common";

import { Follow, FollowDoc, FollowStatus } from "../../models/follow";

/**
 * The follow reject router.
 */
const router = express.Router();

/**
 * Rejects a follow request.
 *
 * @param req - the request object
 * @param res - the response object
 */
router.post(
  "/api/profile/follow/:followId/reject",
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

    const result = await Follow.findByIdAndDelete(follow.id);

    res.send(result);
  }
);

export { router as followRejectRouter };
