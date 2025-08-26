import React, { useState } from "react";
import { format } from "timeago.js";
import { useAuth } from "../contexts/AuthContext";
// import { useAuth } from "../context/AuthContext"; // ✅ make sure path is correct

const Comment = ({ comment }) => {
  const { addReply } = useAuth(); // function from context
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    try {
      await addReply(comment.id, replyText); // ✅ assuming addReply takes (commentId, text)
      setReplyText("");
      setShowReplyBox(false);
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-3">
        <img
          src={`https://ui-avatars.com/api/?name=${comment.user.username}&background=random`}
          alt={comment.user?.username}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="text-sm">
            <span className="font-semibold mr-2">{comment.user?.username}</span>
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
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${reply.user.username}&background=random`}
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
