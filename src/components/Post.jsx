import { useState, useEffect, useRef } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import Comments from "./Comments";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

function Post({ post, onDelete }) {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const { user, deletePost } = useAuth();
  const [countComments, setCountComments] = useState(
    post.comments?.length || 0
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const modalRef = useRef(null);

  // Control native <dialog>
  useEffect(() => {
    if (showComments) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [showComments]);

  const deleteHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await deletePost(post.id);
      if (res.success) {
        onDelete(post.id); // notify parent
        toast.success(res.message || "Post deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete post");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong while deleting post"
      );
    }
    setShowMenu(false);
  };

  const likeHandler = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-gray-200 shadow-md my-6 bg-white transition hover:shadow-lg">
      {/* Top */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={"/profile/" + post.user?.username}>
            <img
              src={
                post.user?.profilePicture || "https://i.pravatar.cc/150?img=1"
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
          </Link>
          <div className="flex flex-col">
            <Link
              to={"/profile/" + post.user?.username}
              className="text-sm font-semibold hover:underline"
            >
              {post.user?.username}
            </Link>
            <span className="text-xs text-gray-500">
              {format(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Show delete menu ONLY if logged-in user owns the post */}
        {user?.id === post.userId && (
          <div className="relative">
            <FiMoreVertical
              className="cursor-pointer text-gray-600 hover:text-black"
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-md text-sm cursor-pointer hover:bg-gray-50 py-2"
                onClick={deleteHandler}
              >
                <span className="block text-center text-red-500 font-medium">
                  Delete
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 text-sm text-gray-800 mb-3">{post.content}</p>
      )}
      {post.image && (
        <div className="w-full">
          <img
            src={post.image}
            alt="post"
            className="w-full object-cover max-h-[500px] rounded-none"
          />
        </div>
      )}

      {/* Bottom */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={likeHandler}
        >
          <AiFillHeart
            className={`text-2xl transition ${
              isLiked ? "text-red-500 scale-110" : "text-gray-300"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {likes} Likes
          </span>
        </div>
        <span
          className="text-sm text-gray-600 cursor-pointer hover:underline"
          onClick={() => setShowComments(true)}
        >
          {countComments} Comments
        </span>
      </div>

      {/* Native Dialog Modal */}
      <dialog ref={modalRef} id="my_modal_4" className="modal">
        <Comments post={post} setShowComments={setShowComments} />
      </dialog>
    </div>
  );
}

export default Post;
