import React from "react";

import LeftNavbar from "../components/LeftNavbar";
import RightNavbar from "../components/RightNavbar";
import Feed from "../components/Feed";


function Home() {
  return (
    <>
      <div className="flex w-full justify-between">
        <LeftNavbar />
        <Feed />
        <RightNavbar />
      </div>
    </>
  );
}

export default Home;
