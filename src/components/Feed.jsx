import { useEffect, useRef, useState, useCallback } from "react";
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

  // reusable fetch (page, reset = false)
  const fetchPosts = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    const res = await fetchFeed(page);

    if (res.success) {
      if (res.posts.length === 0) {
        setHasMore(false);
      }
      setPosts(prev =>
        reset ? res.posts : [...prev, ...res.posts]
      );
    }

    setLoading(false);
  }, [fetchFeed]);

  // load whenever page changes
  useEffect(() => {
    if (hasMore) fetchPosts(currPage, false);
  }, [currPage, hasMore, fetchPosts]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore && !loading) {
        setCurrPage(prev => prev + 1);
      }
    }
  };

  // after delete → force reload from page 1
  const handleDelete = async () => {
    setCurrPage(1);       // reset pagination
    setHasMore(true);
    await fetchPosts(1, true);  // fresh load from backend
  };

  return (
    <div className="w-[500px]">
      <div
        onScroll={handleScroll}
        ref={listRef}
        className="h-[calc(100vh-63px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      >
        {posts.map((p) => (
          <Post key={p.id} post={p} onDelete={handleDelete} />
        ))}

        {loading && (
          <div className="flex justify-center my-4">
            <SpinnerDotted color="rgb(0,149,246)" />
          </div>
        )}

        {!hasMore && !loading && (
          <div className="text-center text-gray-500 my-4">
            No more posts
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
