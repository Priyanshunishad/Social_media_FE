// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { FiPlusSquare } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Logout Handler
  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      toast.success(res.message);
      navigate("/login");
    } else {
      toast.error(res?.message || "Logout failed");
    }
  };

  // ✅ Search Handler
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      e.target.reset();
    } else {
      toast.error("Please enter a search term");
    }
  };

  return (
    <div className="navbar bg-white shadow-sm border-b sticky top-0 z-50">
      {/* ✅ Brand Logo (Previous one restored) */}
      <div className="flex-1">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="text-[32px] px-5 font-bold text-black cursor-pointer font-['Dancing_Script',cursive]">
            Trending Talks
          </span>
        </Link>
      </div>

      {/* ✅ If User is not logged in */}
      {!user ? (
        <div className="flex gap-2 px-4">
          <Link to="/signup" className="btn btn-soft btn-primary">
            Signup
          </Link>
          <Link to="/login" className="btn btn-soft btn-primary">
            Login
          </Link>
        </div>
      ) : (
        <div className="flex gap-6 items-center px-4">
          {/* ✅ Search Box */}
          <form onSubmit={handleSearch}>
            <input
              name="search"
              type="text"
              placeholder="Search..."
              className="input input-bordered w-40 md:w-64 outline-none rounded-full px-4"
            />
          </form>

          {/* ✅ Create Post Button */}
          <button
            aria-label="Create Post"
            className="btn btn-ghost"
            onClick={() => navigate("/create-post")}
          >
            <FiPlusSquare size={26} />
          </button>

          {/* ✅ User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full border">
                <img
                  alt="User Avatar"
                  src={
                    user?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${user?.username}`
                  }
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to={`/profile/${user.username}`}>Profile</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
