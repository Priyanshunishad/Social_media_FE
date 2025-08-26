import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { FiPlusSquare } from "react-icons/fi"; // ✅ Create Post icon

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

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="text-[32px] px-5 font-bold text-black cursor-pointer font-['Dancing_Script',cursive]">
            instagram
          </span>
        </Link>
      </div>

      {!user ? (
        <div className="flex gap-2">
          <button
            className="btn btn-soft btn-primary"
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
          <button
            className="btn btn-soft btn-primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          {/* ✅ Create Post Icon */}
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate("/create-post")}
          >
            <FiPlusSquare size={24} />
          </button>

          {/* ✅ Search Box */}
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />

          {/* ✅ User Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a onClick={() => navigate(`/profile/${user.username}`)}>
                  Profile
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
