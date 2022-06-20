import React from "react";
import cn from "classnames";
import { Outlet } from "react-router-dom";
import AppSideBar from "../AppSideBar/AppSideBar";
import Footer from "../Footer/Footer";

const AppScaffold: React.FC = () => {
  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "min-h-screen",
        "justify-between",
        "w-full",
        "sm:p-8"
      )}
    >
      <AppSideBar>
        <Outlet />
      </AppSideBar>
      <Footer />
    </div>
  );
};

export default AppScaffold;
