import React, { useEffect } from "react";
import cn from "classnames";
import { usePortfolioQuery } from "./PortfolioScreenAPI";
import PortfolioPanel from "./PortfolioPanel";

const PortfolioScreen: React.FC = () => {
  const requestState = usePortfolioQuery();

  useEffect(() => {
    console.log(requestState);
  }, [requestState]);

  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel />
    </div>
  );
};

export default PortfolioScreen;
