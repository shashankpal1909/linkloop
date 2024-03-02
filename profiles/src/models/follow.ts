import mongoose from "mongoose";

/**
 * An enumeration of possible follow status values.
 */
export enum FollowStatus {
  /**
   * The follow request has been accepted.
   */
  Accepted = "accepted",

  /**
   * The follow request is pending approval.
   */
  Pending = "pending",

  /**
   * The follow request has been rejected.
   */
  Rejected = "rejected",
}

/**
 * Interface for follower and following attributes
 */
interface FollowAttrs {
  from: string;
  to: string;
}

/**
 * Interface for the follow model
 */
interface FollowModel extends mongoose.Model<FollowDoc> {
  build(attrs: FollowAttrs): FollowDoc;
}

/**
 * Interface for the follow document
 */
export interface FollowDoc extends mongoose.Document {
  from: string;
  to: string;
  status: FollowStatus;
}

/**
 * Schema for the follow collection
 */
const followSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Builds a new follow document
 * @param attrs - attributes for the follow document
 */
followSchema.statics.build = (attrs: FollowAttrs): FollowDoc => {
  return new Follow({
    from: attrs.from,
    to: attrs.to,
    status: FollowStatus.Pending,
  });
};

/**
 * Model for the follow collection
 */
const Follow = mongoose.model<FollowDoc, FollowModel>("Follow", followSchema);

export { Follow };
