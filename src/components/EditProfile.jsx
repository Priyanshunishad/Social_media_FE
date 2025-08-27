// src/components/EditProfile.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EditProfile({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    profilePicture: "",
  });

  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // feedback popup state
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });

  // ✅ Load form values only when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
      });
      setPreview(user.profilePicture || null);
    }
    if (!isOpen) {
      // reset on modal close
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        profilePicture: "",
      });
      setPreview(null);
      setPopup({ show: false, type: "success", message: "" });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setPopup({ show: true, type: "error", message: "Please select a valid image file." });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setPopup({ show: true, type: "error", message: "File must be < 2MB." });
        return;
      }
      setPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, profilePicture: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("bio", form.bio);
    if (form.profilePicture instanceof File) {
      formData.append("profilePicture", form.profilePicture);
    }

    const res = await updateProfile(formData);

    if (res.success) {
      setPopup({ show: true, type: "success", message: "Profile updated!" });
      setTimeout(() => {
        onClose(); // close modal
        navigate(`/profile/${user.username}`);
      }, 1200);
    } else {
      setPopup({ show: true, type: "error", message: res.message || "Failed to update profile." });
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture with Preview */}
          <div className="flex flex-col items-center">
            <img
              src={preview || "/default-avatar.png"}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover mb-2 border"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
          </div>

          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 border rounded"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full p-2 border rounded"
            rows="3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Feedback Popup inside modal */}
        {popup.show && (
          <div
            className={`mt-4 p-2 rounded text-center ${
              popup.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {popup.message}
          </div>
        )}
      </div>
    </div>
  );
}
