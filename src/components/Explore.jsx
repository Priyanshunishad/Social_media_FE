import { useEffect, useRef, useState, useCallback } from "react";
import { SpinnerDotted } from "spinners-react";
import { useAuth } from "../contexts/AuthContext";
import LeftNavbar from "./LeftNavbar"; // ✅ import your navbar

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currPage, setCurrPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Dummy hashtags
  const [hashtags, setHashtags] = useState([
    "ViratKohliWithAnushaka",
  "BJPJindabad",
  "CongressJindad",
  "RahulGandhiChorHai",
  "DehliStreetDogsBan",
  "UPPolitics",  
  "YouthPolitics",
  "Dream11Ban",
  "IndianDemocracy",
]);


  const [users, setUsers] = useState([]);
  const [sideLoading, setSideLoading] = useState(true);

  const { fetchFeed, getAllUsers, user } = useAuth();
  const listRef = useRef();

  // ✅ fetch explore posts
  const fetchPosts = useCallback(
    async (page = 1, reset = false) => {
      setLoading(true);
      const res = await fetchFeed(page);

      if (res.success) {
        if (res.posts.length === 0) setHasMore(false);
        setPosts((prev) => (reset ? res.posts : [...prev, ...res.posts]));
      }
      setLoading(false);
    },
    [fetchFeed]
  );

  useEffect(() => {
    if (hasMore) fetchPosts(currPage, false);
  }, [currPage, hasMore, fetchPosts]);

  // ✅ fetch sidebar users only (hashtags dummy hi hain)
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const usersData = await getAllUsers?.();

        if (usersData?.users) {
          setUsers(
            user ? usersData.users.filter((u) => u.id !== user.id) : usersData.users
          );
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setSideLoading(false);
      }
    };

    fetchSidebarData();
    const interval = setInterval(fetchSidebarData, 15000); // auto refresh
    return () => clearInterval(interval);
  }, [getAllUsers, user?.id]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore && !loading) {
        setCurrPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Left Navbar */}
      <div className="w-64 border-r border-gray-200">
        <LeftNavbar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Explore Posts Section */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 max-w-3xl h-[calc(100vh-63px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        >
          {/* Explore Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">🔍 Explore</h1>
            <p className="text-gray-500">
              Discover trending topics & posts just like Instagram Explore.
            </p>
          </div>

          {/* Post Grid */}
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <div key={post.id} className="relative group cursor-pointer">
                <img
                  src={post.image || "https://via.placeholder.com/300"}
                  alt={post.caption || "post"}
                  className="w-full h-60 object-cover rounded-md"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-sm">
                    {post.caption?.slice(0, 40)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex justify-center my-4">
              <SpinnerDotted color="rgb(0,149,246)" />
            </div>
          )}
          {!hasMore && !loading && (
            <div className="text-center text-gray-500 my-4">No more posts</div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Trending Hashtags */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">🔥 Trending</h2>
            {hashtags.length === 0 ? (
              <p className="text-sm text-gray-500">No trending hashtags</p>
            ) : (
              <ul className="space-y-3">
                {hashtags.map((tag, index) => (
                  <li
                    key={index}
                    className="text-blue-600 cursor-pointer hover:underline hover:text-blue-800 transition"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Who to Follow */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">👥 Who to follow</h2>
            {sideLoading ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found</p>
            ) : (
              <ul className="space-y-4">
                {users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.profilePicture ||
                          `https://ui-avatars.com/api/?name=${u.username}`
                        }
                        alt={u.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{u.username}</p>
                        <p className="text-gray-500 text-sm">@{u.username}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                      Follow
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
