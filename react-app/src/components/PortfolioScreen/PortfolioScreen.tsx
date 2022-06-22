import React from "react";
import cn from "classnames";
import PortfolioPanel from "./PortfolioPanel";

const PortfolioScreen: React.FC = () => {
  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel />
    </div>
  );
};

export default PortfolioScreen;
