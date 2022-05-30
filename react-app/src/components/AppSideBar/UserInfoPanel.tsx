import React, { useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import Config from "../../config/Config";
import { ParsedCoin } from "../../api/cosmosAPI";
import { convertToReadableBalance } from "../../utils/coin";

export interface UserInfo {
  balance: ParsedCoin;
  address: string;
}

interface UserInfoPanelProps {
  className?: string;
  userInfo: UserInfo | null;
}
const UserInfoPanel: React.FC<UserInfoPanelProps> = (props) => {
  const { className, userInfo } = props;
  const { coinDenom, coinDecimals } = Config.chainInfo.currency;

  const balance = useMemo(
    () => userInfo?.balance.amount ?? new BigNumber(0),
    [userInfo]
  );

  return (
    <div className={cn("flex", "flex-col", "gap-y-3", className)}>
      <div className={cn("flex", "flex-col")}>
        <h3
          className={cn(
            "text-2xl",
            "leading-tight",
            "font-medium",
            "text-black",
            "break-all"
          )}
        >
          {`${convertToReadableBalance(balance, coinDecimals)} ${coinDenom}`}
        </h3>
        <p
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-lightgreen"
          )}
        >
          {convertToReadableBalance(balance, coinDecimals, 9)}
        </p>
      </div>
    </div>
  );
};

export { UserInfoPanel };
