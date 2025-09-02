// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { FiPlusSquare, FiMenu, FiX, FiSearch } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
      setShowSearch(false);
    } else {
      toast.error("Please enter a search term");
    }
  };

  return (
    <div className="navbar bg-white shadow-sm border-b sticky top-0 z-50 px-4">
      {/* ✅ Brand Logo */}
      <div className="flex-1">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="text-2xl md:text-[32px] font-bold text-black cursor-pointer font-['Dancing_Script',cursive]">
            Trending Talks
          </span>
        </Link>
      </div>

      {/* ✅ Mobile Menu Button */}
      <div className="flex md:hidden items-center gap-3">
        {user && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-ghost p-2"
          >
            <FiSearch size={22} />
          </button>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-ghost p-2"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ✅ Desktop Menu */}
      {!user ? (
        <div className="hidden md:flex gap-2 px-4">
          <Link to="/signup" className="btn btn-soft btn-primary">
            Signup
          </Link>
          <Link to="/login" className="btn btn-soft btn-primary">
            Login
          </Link>
        </div>
      ) : (
        <div className="hidden md:flex gap-6 items-center px-4">
          {/* ✅ Search Box */}
          <form onSubmit={handleSearch}>
            <input
              name="search"
              type="text"
              placeholder="Search..."
              className="border border-gray-300 py-2 w-40 md:w-64 outline-none rounded-full px-4"
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
                    user?.profilePicture
                      ? user.profilePicture
                      : `https://ui-avatars.com/api/?name=${user?.username?.charAt(
                          0
                        )}&size=128&background=random&color=fff`
                  }
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
             
              {
                user.role === "ADMIN" && (
                  <li>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </li>
                )
              }
              {
                user.role !== "ADMIN" && (
                  <li>
                    <Link to={`/profile/${user.username}`}>Profile</Link>
                  </li>
                )
              }
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ✅ Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-52 p-3 flex flex-col gap-3 md:hidden z-50">
          {!user ? (
            <>
              <Link to="/signup" className="btn btn-soft btn-primary w-full">
                Signup
              </Link>
              <Link to="/login" className="btn btn-soft btn-primary w-full">
                Login
              </Link>
            </>
          ) : (
            <>
              {showSearch && (
                <form onSubmit={handleSearch} className="mb-2">
                  <input
                    name="search"
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 py-2 w-full outline-none rounded-full px-4"
                  />
                </form>
              )}

              <button
                onClick={() => navigate("/create-post")}
                className="btn btn-outline w-full"
              >
                <FiPlusSquare size={20} className="mr-2" /> Create Post
              </button>

              <Link
                to={`/profile/${user.username}`}
                className="btn btn-ghost w-full"
              >
                Profile
              </Link>

              <button onClick={handleLogout} className="btn btn-error w-full">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;


