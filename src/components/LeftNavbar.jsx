import React, { useState } from "react";

const navItems = [
  { label: "Home", icon: "🏠", link: "/" },
  { label: "Search", icon: "🔍", link: "/search" },
  { label: "Explore", icon: "🧭", link: "/explore" },
  { label: "Notifications", icon: "❤️", link: "/notifications" },
  { label: "Profile", icon: "👤", link: "/profile" },
];

const LeftNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative top-0 left-0 h-screen bg-white border-r border-gray-200 
      p-6 w-64 transform transition-transform duration-300 z-50
      ${open ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <span className="text-2xl font-bold font-serif">Instagram</span>
        <button
          className="md:hidden btn btn-ghost btn-sm"
          onClick={() => setOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      {/* Nav List */}
      <ul className="menu bg-transparent p-0">
        {navItems.map((item) => (
          <li key={item.label} className="mb-4">
            <a
              href={item.link}
              className="flex items-center gap-x-8 py-6 px-2 text-gray-700 hover:text-blue-500 rounded-lg transition"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg font-medium">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftNavbar;
