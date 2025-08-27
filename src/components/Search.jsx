// src/pages/SearchPage.js
import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiSearch } from "react-icons/fi";

const SearchPage = () => {
  const { search } = useLocation(); // e.g. ?q=jai123
  const navigate = useNavigate();
  const query = new URLSearchParams(search).get("q") || "";

  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { searchUsers } = useAuth();

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await searchUsers(query);

        if (res.success) {
          setResults(res.data);
        } else {
          setError("No results found");
        }
      } catch (err) {
        setError("Something went wrong while fetching results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, searchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto">
      {/* Search Input */}
      <form
        onSubmit={handleSearch}
        className="w-full flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full shadow-sm"
      >
        <FiSearch className="text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Search users..."
          className="bg-transparent flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <h1 className="text-xl font-semibold mt-6 mb-3 text-center">
        Search Results{" "}
        {query && (
          <>
            for "<span className="text-blue-500">{query}</span>"
          </>
        )}
      </h1>

      {/* ✅ Skeleton Loader */}
      {loading && (
        <div className="w-full mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 rounded-lg animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {!loading && !error && results.length === 0 && query && (
        <p className="text-gray-400 mt-4">No users found.</p>
      )}

      {/* ✅ Results */}
      {!loading && (
        <div className="w-full mt-4">
          {results.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.username}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
            >
              <img
                src={
                  user.profilePicture ||
                  `https://ui-avatars.com/api/?name=${user.username}`
                }
                alt={user.username}
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <h2 className="font-medium text-gray-900">{user.username}</h2>
                <p className="text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
