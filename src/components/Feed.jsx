import { useEffect, useRef, useState } from "react";
import { SpinnerDotted } from "spinners-react";
import Post from "./Post";
import { useAuth } from "../contexts/AuthContext";

function Feed() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currPage, setCurrPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { fetchFeed } = useAuth();
  const listRef = useRef();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const res = await fetchFeed(currPage);
      if (res.success) {
        if (res.posts.length === 0) setHasMore(false);
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setLoading(false);
    };
    if (hasMore) fetchPosts();
  }, [currPage, fetchFeed, hasMore]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore && !loading) {
        setCurrPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="w-[500px]">
      <div
        onScroll={handleScroll}
        ref={listRef}
        className="h-[calc(100vh-63px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      >
        {posts.map((p) => (
          <Post key={p._id} post={p} />
        ))}

        {loading && (
          <div className="flex justify-center my-4">
            <SpinnerDotted color="rgb(0,149,246)" />
          </div>
        )}

        {!hasMore && !loading && (
          <div className="text-center text-gray-500 my-4">No more posts</div>
        )}
      </div>
    </div>
  );
}

export default Feed;
