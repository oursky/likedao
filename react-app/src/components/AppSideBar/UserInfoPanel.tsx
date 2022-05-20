import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import Config from "../../config/Config";
import { ParsedCoin } from "../../api/cosmosAPI";
import { convertToReadableBalance } from "../../utils/coin";
import CopyableText from "../common/CopyableText/CopyableText";
import { useLocale } from "../../providers/AppLocaleProvider";

export interface UserInfo {
  balance: ParsedCoin;
  address: string;
}

interface UserInfoPanelProps {
  className?: string;
  userInfo: UserInfo | null;
}
const UserInfoPanel: React.FC<UserInfoPanelProps> = (props) => {
  const { userInfo, className } = props;
  const { coinDenom, coinDecimals } = Config.chainInfo.currency;
  const { translate } = useLocale();

  const balance = useMemo(
    () => userInfo?.balance.amount ?? new BigNumber(0),
    [userInfo]
  );

  const onAddressCopied = useCallback(() => {
    toast.success(translate("UserInfoPanel.addressCopied"));
  }, [translate]);

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

      <CopyableText
        className={cn(
          "text-[11px]",
          "leading-6",
          "font-medium",
          "text-likecoin-green"
        )}
        text={userInfo?.address ?? ""}
        onCopied={onAddressCopied}
      />
    </div>
  );
};

export { UserInfoPanel };
