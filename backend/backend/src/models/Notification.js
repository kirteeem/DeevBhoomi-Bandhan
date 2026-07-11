import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // The user this notification is *about* (e.g. the sender of an interest,
    // or the person who accepted one). Lets the frontend link straight to
    // that person's profile instead of trying to reuse relatedId (which
    // points at the Interest/other document id, not a user id).
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["new_interest", "interest_accepted", "new_message", "kundali_ready", "profile_verified", "system"],
      required: true,
    },
    title: String,
    body: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
