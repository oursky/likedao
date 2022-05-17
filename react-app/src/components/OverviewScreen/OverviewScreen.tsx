import React from "react";
import cn from "classnames";

const OverviewScreen: React.FC = () => {
  return (
    <div
      className={cn(
        "h-full",
        "w-full",
        "overflow-auto",
        "bg-gradient-to-b",
        "from-white",
        "to-likecoin-primary-bg",
        "p-8"
      )}
    >
      <div
        className={cn("h-full", "flex", "flex-row", "gap-4", "justify-center")}
      >
        <div className={cn("flex-0", "w-72", "bg-red-400")}>
          <p>SideBar</p>
        </div>
        <div className={cn("flex-1", "bg-blue-400", "max-w-5xl")}>
          <p>Main Content</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
