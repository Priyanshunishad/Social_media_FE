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
        toast.success(res.message);
        navigate("/"); // redirect to feed/home page
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="card w-full max-w-3xl shadow-xl bg-white flex flex-col md:flex-row overflow-hidden">
        {/* Left: Image Upload */}
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center border-r">
          {preview ? (
            <div className="w-full aspect-square overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer text-gray-400">
              <AiOutlineCloudUpload size={48} className="mb-2" />
              <span className="text-lg font-semibold">Click to upload an image</span>
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
          <h2 className="text-2xl font-bold text-gray-700">Create Post</h2>
          <textarea
            placeholder="Write a caption..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea textarea-bordered h-40 resize-none"
          />

          <div className="flex justify-between items-center mt-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-primary btn-wide ${loading ? "loading" : ""}`}
            >
              {loading ? "Posting..." : "Share"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
