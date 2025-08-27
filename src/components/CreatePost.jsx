import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { AiOutlineCloudUpload } from "react-icons/ai";

const CreatePostPage = () => {
  const { createPost } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !image) {
      toast.error("Please add content or select an image");
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      const res = await createPost(formData);
      if (res.success) {
        toast.success(res.message || "Post created!");
        navigate("/");
      } else {
        toast.error(res.message || "Failed to create post");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left: Image Upload */}
          <div className="md:w-1/2 bg-base-200 flex items-center justify-center border-r">
            {preview ? (
              <div className="w-full aspect-square">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-gray-600 transition">
                <AiOutlineCloudUpload size={56} className="mb-3 opacity-70" />
                <span className="text-sm font-medium">
                  Click to upload an image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Right: Caption & Actions */}
          <div className="md:w-1/2 flex flex-col p-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Create new post
            </h2>

            <textarea
              placeholder="Write a caption..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full h-40 resize-none rounded-xl"
            />

            <div className="flex justify-between items-center mt-auto gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Share"
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                disabled={loading}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
