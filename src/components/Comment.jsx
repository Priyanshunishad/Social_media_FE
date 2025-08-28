import React, { useState } from "react";
import { format } from "timeago.js";
import { useAuth } from "../contexts/AuthContext";

const Comment = ({ comment, refetchComments }) => {
  const { addReply, user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await addReply(comment.id, replyText);

      if (res?.success) {
        // ✅ optimistic update: add reply at top immediately
        const populatedReply = {
          ...res.reply,
          user: {
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };

        comment.replies = [populatedReply, ...(comment.replies || [])];

        setReplyText("");
        setShowReplyBox(false);

        // ✅ then refetch to sync with backend (latest replies from all users)
        if (refetchComments) refetchComments();
      }
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3">
        <img
          src={
            comment?.user?.profilePicture ||
            `https://ui-avatars.com/api/?name=${comment?.user?.username}&background=random`
          }
          alt={comment?.user?.username}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="text-sm">
            <span className="font-semibold mr-2">
              {comment?.user?.username}
            </span>
            {comment.text}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{format(comment.createdAt)}</span>
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              Reply
            </button>
          </div>

          {/* Reply Input */}
          {showReplyBox && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <button
                onClick={handleAddReply}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
              >
                Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="pl-12 space-y-2">
          {[...comment.replies]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // ✅ newest → oldest
            .map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <img
                  src={
                    reply?.user?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${reply?.user?.username}&background=random`
                  }
                  alt={reply.user?.username}
                  className="w-7 h-7 rounded-full"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold mr-2">
                      {reply.user?.username}
                    </span>
                    {reply.text}
                  </p>
                  <span className="text-xs text-gray-500">
                    {format(reply.createdAt)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
