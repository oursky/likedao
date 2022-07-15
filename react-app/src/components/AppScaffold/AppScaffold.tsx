import React, { useCallback, useState } from "react";
import cn from "classnames";
import { Outlet } from "react-router-dom";
import AppSideBar from "../AppSideBar/AppSideBar";
import Footer from "../Footer/Footer";

const AppScaffold: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, [setIsMenuOpen]);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "min-h-screen",
        "justify-between",
        "sm:justify-start",
        "w-full",
        "sm:w-full",
        "min-w-0",
        "sm:p-8",
        "sm:overflow-x-auto",
        isMenuOpen && cn("overflow-hidden", "h-screen")
      )}
    >
      <AppSideBar
        isMenuOpen={isMenuOpen}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
      >
        <Outlet />
      </AppSideBar>
      <Footer />
    </div>
  );
};

export default AppScaffold;
