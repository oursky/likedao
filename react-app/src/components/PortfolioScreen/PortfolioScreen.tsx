import React, { useEffect } from "react";
import { usePortfolioQuery } from "./PortfolioScreenAPI";

const PortfolioScreen: React.FC = () => {
  const requestState = usePortfolioQuery();

  useEffect(() => {
    console.log(requestState);
  }, [requestState]);

  return <div>Portfolio Screen</div>;
};

export default PortfolioScreen;
