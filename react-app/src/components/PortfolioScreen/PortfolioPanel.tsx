import React from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";

interface PortfolioPanelProps {}

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({}) => {
  return (
    <Paper className={cn("py-6", "px-5")}>
      <div className={cn("flex")}>
        <Icon
          className={cn("fill-likecoin-black", "mr-3")}
          icon={IconType.PieChart}
          height={20}
          width={20}
        />
        <h2
          className={cn(
            "text-lg",
            "font-bold",
            "leading-5",
            "text-likecoin-black"
          )}
        >
          <LocalizedText messageID="PortfolioScreen.yourPortfolio" />
        </h2>
      </div>
    </Paper>
  );
};

export default PortfolioPanel;
