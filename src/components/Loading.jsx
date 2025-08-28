import React from "react";

const ExploreSkeleton = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Left Navbar Skeleton */}
      <div className="w-64 border-r border-gray-200 p-6 flex flex-col justify-between animate-pulse">
        {/* Header */}
        <div>
          <div className="h-8 w-40 bg-gray-300 rounded mb-10"></div>

          {/* Nav Items */}
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-x-4">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="h-10 w-full bg-gray-300 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Explore Posts Section */}
        <div className="flex-1 max-w-3xl h-[calc(100vh-63px)] overflow-y-auto">
          {/* Explore Header */}
          <div className="mb-6 animate-pulse">
            <div className="h-8 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-72 bg-gray-200 rounded"></div>
          </div>

          {/* Skeleton Grid for Posts */}
          <div className="grid grid-cols-3 gap-2 animate-pulse">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-60 bg-gray-300 rounded-md"
              ></div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-6 animate-pulse">
          {/* Trending Hashtags */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 space-y-3">
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-24 bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Who to Follow */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 space-y-4">
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreSkeleton;
