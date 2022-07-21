import React from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import {
  convertBigNumberToFixedPointString,
  convertBigNumberToMillifiedIntegerString,
} from "../../../utils/number";

interface CoinBalanceCardProps {
  balance: BigNumber;
  denom: string;
  className?: string;
}

const CoinBalanceCard: React.FC<CoinBalanceCardProps> = ({
  balance,
  denom,
  className,
}) => {
  return (
    <div className={cn("flex", "flex-col", className)}>
      <h3
        className={cn(
          "text-2xl",
          "leading-tight",
          "font-medium",
          "text-black",
          "break-all"
        )}
      >
        {`${convertBigNumberToMillifiedIntegerString(balance)} ${denom}`}
      </h3>
      <p
        className={cn(
          "text-sm",
          "leading-5",
          "font-medium",
          "text-app-lightgreen"
        )}
      >
        {convertBigNumberToFixedPointString(balance, 9)}
      </p>
    </div>
  );
};

export default CoinBalanceCard;
