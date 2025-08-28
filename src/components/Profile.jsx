// src/components/Profile.js
import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import LeftNavbar from "./LeftNavbar";
import Followers from "./Followers"; 
import Following from "./Following"; // ✅ import new modal

function Profile({ userData }) {
  const { username } = useParams();
  const { user: authUser, fetchProfilePosts, fetchUserByUsername } = useAuth();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false); // ✅ new state

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      setError(null);

      try {
        if (userData) setUser(userData);
        else if (authUser && (!username || authUser.username === username))
          setUser(authUser);
        else if (username) {
          const res = await fetchUserByUsername(username);
          if (res) setUser(res);
          else {
            setError("User not found");
            setUser(null);
          }
        }
      } catch (err) {
        setError("Failed to load user profile");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [userData, authUser?.id, authUser?.username, username]);
  console.log(user);
  

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!user?.id) return;

      setLoadingPosts(true);
      try {
        const profilePosts = await fetchProfilePosts(user.id);
        if (profilePosts?.success && Array.isArray(profilePosts.posts))
          setPosts(profilePosts.posts);
        else setPosts([]);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [user?.id]);

  const postCount = posts.length;
  const followerCount = user?.followers?.length || 0;
  const followingCount = user?.following?.length || 0;

  if (loadingUser) {
    return <p className="p-6">Loading profile...</p>;
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">{error || "User not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Navbar */}
      <div className="hidden md:block w-64 border-r">
        <LeftNavbar />
      </div>

      {/* Main Profile Content */}
      <div className="flex-1 flex flex-col items-center mt-6 px-3">
        {/* Profile Header */}
        <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex justify-center md:justify-start">
            <img
              src={
                    user.profilePicture ||
                    `https://ui-avatars.com/api/?name=${user.username}`
                  }
              alt={`${user.username || "User"} profile`}
              className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border"
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-2xl font-light">
                {user.username || "Unknown User"}
              </h2>
              <button
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <FiSettings className="text-2xl" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-4 text-sm">
              <span>
                <strong>{postCount}</strong> posts
              </span>
              <button
                className="hover:underline"
                onClick={() => setIsFollowersOpen(true)} // ✅ open followers
              >
                <strong>{followerCount}</strong> followers
              </button>
              <button
                className="hover:underline"
                onClick={() => setIsFollowingOpen(true)} // ✅ open following
              >
                <strong>{followingCount}</strong> following
              </button>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {(user.firstName || user.lastName) && (
                <p className="font-semibold capitalize">
                  {user.firstName} {user.lastName}
                </p>
              )}
              <p className="text-sm text-gray-700 max-w-md">
                {user.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl border-t mt-8"></div>

        {/* Posts */}
        <div className="w-full max-w-5xl grid grid-cols-3 gap-1 mt-6">
          {loadingPosts ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-300 animate-pulse" />
            ))
          ) : postCount > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.id || post._id || `post-${index}`}
                className="aspect-square"
              >
                <img
                  src={post.image || "https://via.placeholder.com/400"}
                  alt={`${user.username || "User"} post ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 cursor-pointer transition-opacity"
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

      {/* Followers Modal */}
      {isFollowersOpen && (
        <Followers
          followers={user.followers || []}
          onClose={() => setIsFollowersOpen(false)}
        />
      )}

      {/* Following Modal */}
      {isFollowingOpen && (
        <Following
          following={user.following || []}
          onClose={() => setIsFollowingOpen(false)}
        />
      )}
    </div>
  );
}

export default Profile;



// // src/components/Profile.js
// import React, { useEffect, useState } from "react";
// import { FiSettings } from "react-icons/fi";
// import { useAuth } from "../contexts/AuthContext";
// import { useParams } from "react-router-dom";
// import LeftNavbar from "./LeftNavbar"; // ✅ import sidebar

// function Profile({ userData }) {
//   const { username } = useParams();
//   const { user: authUser, fetchProfilePosts, fetchUserByUsername } = useAuth();

//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loadingUser, setLoadingUser] = useState(true);
//   const [loadingPosts, setLoadingPosts] = useState(false);
//   const [error, setError] = useState(null);

//   // Load user data
//   useEffect(() => {
//     const loadUser = async () => {
//       setLoadingUser(true);
//       setError(null);

//       try {
//         if (userData) setUser(userData);
//         else if (authUser && (!username || authUser.username === username))
//           setUser(authUser);
//         else if (username) {
//           const res = await fetchUserByUsername(username);
//           if (res) setUser(res);
//           else {
//             setError("User not found");
//             setUser(null);
//           }
//         }
//       } catch (err) {
//         setError("Failed to load user profile");
//         setUser(null);
//       } finally {
//         setLoadingUser(false);
//       }
//     };

//     loadUser();
//   }, [userData, authUser?.id, authUser?.username, username]);

//   // Load posts
//   useEffect(() => {
//     const loadPosts = async () => {
//       if (!user?.id) return;

//       setLoadingPosts(true);
//       try {
//         const profilePosts = await fetchProfilePosts(user.id);
//         if (profilePosts?.success && Array.isArray(profilePosts.posts))
//           setPosts(profilePosts.posts);
//         else setPosts([]);
//       } catch (err) {
//         setPosts([]);
//       } finally {
//         setLoadingPosts(false);
//       }
//     };

//     loadPosts();
//   }, [user?.id]);

//   const postCount = posts.length;
//   const followerCount = user?.followers?.length || 0;
//   const followingCount = user?.following?.length || 0;

//   if (loadingUser) {
//     return <p className="p-6">Loading profile...</p>;
//   }

//   if (error || !user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-gray-600">{error || "User not found"}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen">
//       {/* ✅ Left Navbar fixed */}
//       <div className="hidden md:block w-64 border-r">
//         <LeftNavbar />
//       </div>

//       {/* ✅ Main Profile Content */}
//       <div className="flex-1 flex flex-col items-center mt-6 px-3">
//         {/* Profile Header */}
//         <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
//           <div className="flex justify-center md:justify-start">
//             <img
//               src={
//                 user.profilePicture ||
//                 "https://via.placeholder.com/180?text=No+Image"
//               }
//               alt={`${user.username || "User"} profile`}
//               className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border"
//               onError={(e) =>
//                 (e.target.src = "https://via.placeholder.com/180?text=No+Image")
//               }
//             />
//           </div>

//           <div className="flex flex-col flex-1">
//             <div className="flex flex-wrap items-center gap-4">
//               <h2 className="text-2xl font-light">
//                 {user.username || "Unknown User"}
//               </h2>
//               <button
//                 className="p-1 rounded-full hover:bg-gray-100 transition-colors"
//                 aria-label="Settings"
//               >
//                 <FiSettings className="text-2xl" />
//               </button>
//             </div>

//             {/* Stats */}
//             <div className="flex gap-8 mt-4 text-sm">
//               <span>
//                 <strong>{postCount}</strong> posts
//               </span>
//               <span>
//                 <strong>{followerCount}</strong> followers
//               </span>
//               <span>
//                 <strong>{followingCount}</strong> following
//               </span>
//             </div>

//             {/* Bio */}
//             <div className="mt-4">
//               {(user.firstName || user.lastName) && (
//                 <p className="font-semibold capitalize">
//                   {user.firstName} {user.lastName}
//                 </p>
//               )}
//               <p className="text-sm text-gray-700 max-w-md">
//                 {user.bio || "No bio available"}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="w-full max-w-5xl border-t mt-8"></div>

//         {/* Posts */}
//         <div className="w-full max-w-5xl grid grid-cols-3 gap-1 mt-6">
//           {loadingPosts ? (
//             [...Array(6)].map((_, i) => (
//               <div key={i} className="aspect-square bg-gray-300 animate-pulse" />
//             ))
//           ) : postCount > 0 ? (
//             posts.map((post, index) => (
//               <div
//                 key={post.id || post._id || `post-${index}`}
//                 className="aspect-square"
//               >
//                 <img
//                   src={post.image || "https://via.placeholder.com/400"}
//                   alt={`${user.username || "User"} post ${index + 1}`}
//                   className="w-full h-full object-cover hover:opacity-90 cursor-pointer transition-opacity"
//                   onError={(e) =>
//                     (e.target.src = "https://via.placeholder.com/400")
//                   }
//                 />
//               </div>
//             ))
//           ) : (
//             <div className="col-span-3 text-center text-gray-500 py-10">
//               No posts yet
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Profile;
