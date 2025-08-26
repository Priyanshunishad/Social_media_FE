import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

function Profile({ userData }) {
  const { user: authUser, fetchProfilePosts } = useAuth();

  const [user, setUser] = useState(userData || authUser || null);
  const [posts, setPosts] = useState(userData?.posts || []);
  const [followed, setFollowed] = useState(false);

  // Fetch posts when profile loads
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      try {
        const profilePosts = await fetchProfilePosts(user.id);
        console.log("profilePosts", profilePosts);
        
        if (profilePosts.success) setPosts(profilePosts.posts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    };

    loadPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const followHandler = () => {
    // ⚡ Here you’d call your backend follow/unfollow API
    setFollowed((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center w-full mt-6 px-3">
      {/* Profile Top Section */}
      <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Picture */}
        <div className="flex justify-center md:justify-start">
          <img
            src={
              user.profilePicture ||
              "https://via.placeholder.com/180?text=No+Image"
            }
            alt="profile"
            className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border"
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col flex-1">
          {/* Username + Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-light">{user.username}</h2>

            {/* Edit only for logged-in user */}
            {authUser?.id === user.id && (
              <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">
                Edit Profile
              </button>
            )}

            <FiSettings className="text-2xl cursor-pointer" />

            {/* Follow / Unfollow */}
            {authUser?.id !== user.id && (
              <button
                onClick={followHandler}
                className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                  followed
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {followed ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-4 text-sm">
            <span>
              <strong>{posts.length}</strong> posts
            </span>
            <span>
              <strong>{user.followers?.length || 0}</strong> followers
            </span>
            <span>
              <strong>{user.following?.length || 0}</strong> following
            </span>
          </div>

          {/* Bio */}
          <div className="mt-4">
            <p className="font-semibold capitalize">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-700 max-w-md">
              {user.bio || "No bio available"}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-5xl border-t mt-8"></div>

      {/* Posts Grid */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-1 mt-6">
        {posts.length > 0 ? (
          posts.map((p) => (
            <div key={p.id || p._id} className="aspect-square">
              <img
                src={p.image || "https://via.placeholder.com/400"}
                alt="post"
                className="w-full h-full object-cover hover:opacity-90 cursor-pointer"
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-10">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
