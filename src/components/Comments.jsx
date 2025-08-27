import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { FiX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import Comment from "./Comment";

const Comments = ({ post, setShowComments }) => {
  const { getComments ,commentsOnPost ,user} = useAuth();
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");



  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments(post.id);
      if (data?.comments) setComments(data.comments);
    };
    fetchComments();
  }, [post.id, getComments]);

  const addComment=async()=>{
    if(commentText.trim() ==="") return;
    const newComment=await commentsOnPost( post.id,commentText)
    // 
     if (newComment?.success) {
    const populatedComment = {
      ...newComment.comment,
      user: {
        username: user.username,
        profilePicture: user.profilePicture,
      },
      replies: [],
    };

    setComments((prev) => [...prev, populatedComment]);
  }
  setCommentText("");
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl h-[80%] rounded-xl flex overflow-hidden">
        
        {/* LEFT: Post Image */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {post.image ? (
            <img
              src={post.image}
              alt="post"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-gray-400">No Image</div>
          )}
        </div>

        {/* RIGHT: Comments Section */}
        <div className="w-[400px] flex flex-col relative">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.user?.username}`}>
                <img
                  src={
                    post.user?.profilePicture ||
                    "https://i.pravatar.cc/150?img=1"
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <Link
                to={`/profile/${post.user?.username}`}
                className="text-sm font-semibold hover:underline"
              >
                {post.user?.username}
              </Link>
            </div>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-600 hover:text-black"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Caption */}
          {post.content && (
            <div className="px-4 py-3 border-b">
              <p className="text-sm">
                <span className="font-semibold mr-2">
                  {post.user?.username}
                </span>
                {post.content}
              </p>
              <span className="text-xs text-gray-500">
                {format(post.createdAt)}
              </span>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No comments yet
              </p>
            )}

            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>

          {/* Comment Input */}
          <div className="border-t px-4 py-3 flex items-center gap-3">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none border-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}  


            />
            <button onClick={addComment} className="text-blue-500 font-semibold text-sm">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
