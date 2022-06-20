import React, { useCallback, useState } from "react";
import cn from "classnames";
import { Outlet } from "react-router-dom";
import AppSideBar from "../AppSideBar/AppSideBar";
import Footer from "../Footer/Footer";

const AppScaffold: React.FC = () => {
  const [isScollLocked, setIsScollLocked] = useState(false);

  const lockScroll = useCallback(() => {
    setIsScollLocked(true);
  }, [setIsScollLocked]);

  const unlockScroll = useCallback(() => {
    setIsScollLocked(false);
  }, [setIsScollLocked]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "min-h-screen",
        "justify-between",
        "w-full",
        "sm:p-8",
        "sm:overflow-auto",
        isScollLocked && cn("overflow-hidden", "h-screen")
      )}
    >
      <AppSideBar onMenuOpen={lockScroll} onMenuClose={unlockScroll}>
        <Outlet />
      </AppSideBar>
      <Footer />
    </div>
  );
};

export default AppScaffold;
