import { useEffect, useState } from "react";
import { AiOutlineClose, AiFillHeart } from "react-icons/ai";
import { format } from "timeago.js";
// import api from "../utils/api"; // your axios instance

function CommentsModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comment/${postId}`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [postId]);

  // Add new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await api.post(`/comment/${postId}`, { text });
      setComments([res.data, ...comments]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Like a comment
  const handleLike = async (commentId) => {
    try {
      const res = await api.post(`/comment/like/${commentId}`);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[400px] rounded-2xl shadow-lg p-4 relative max-h-[80vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <AiOutlineClose size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {comments.length === 0 && (
            <p className="text-gray-500 text-sm">No comments yet</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3">
              <img
                src={c.user?.profilePic || "/default-avatar.png"}
                alt={c.user?.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{c.user?.username}</span>{" "}
                  {c.text}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span>{format(c.createdAt)}</span>
                  <button
                    onClick={() => handleLike(c._id)}
                    className="flex items-center gap-1"
                  >
                    <AiFillHeart
                      className={`${
                        c.likes?.length ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                    {c.likeCount}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t mt-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm px-3 py-2 border rounded-lg outline-none"
          />
          <button
            type="submit"
            className="text-blue-500 font-semibold text-sm disabled:text-gray-400"
            disabled={!text.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal;
