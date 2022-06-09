import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import Config from "../../config/Config";
import { convertBigNumberToFixedPointString } from "../../utils/number";
import CopyableText from "../common/CopyableText/CopyableText";
import { useLocale } from "../../providers/AppLocaleProvider";
import { IconType } from "../common/Icons/Icons";
import { BigNumberCoin } from "../../models/coin";
import { ShortcutButton } from "./ShotcutButton";

export interface UserInfo {
  balance: BigNumberCoin;
  address: string;
}

interface UserInfoPanelProps {
  className?: string;
  userInfo: UserInfo | null;
  onClickSend: () => void;
  onClickReceive: () => void;
  onClickReward: () => void;
  onClickReinvest: () => void;
}
const UserInfoPanel: React.FC<UserInfoPanelProps> = (props) => {
  const { userInfo, className, onClickSend, onClickReceive, onClickReward } =
    props;
  const { coinDenom } = Config.chainInfo.currency;
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
          {`${convertBigNumberToFixedPointString(balance)} ${coinDenom}`}
        </h3>
        <p
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-lightgreen"
          )}
        >
          {convertBigNumberToFixedPointString(balance, 9)}
        </p>
      </div>

      <CopyableText
        className={cn(
          "text-2xs",
          "leading-6",
          "font-medium",
          "text-likecoin-green"
        )}
        text={userInfo?.address ?? ""}
        onCopied={onAddressCopied}
      />

      <div className={cn("flex", "flex-row", "gap-x-3")}>
        <ShortcutButton
          className={cn("flex-1")}
          icon={IconType.Send}
          labelId="UserInfoPanel.shortcuts.send"
          onClick={onClickSend}
        />
        <ShortcutButton
          className={cn("flex-1")}
          icon={IconType.Add}
          labelId="UserInfoPanel.shortcuts.receive"
          onClick={onClickReceive}
        />
        <ShortcutButton
          className={cn("flex-1")}
          icon={IconType.Gift}
          labelId="UserInfoPanel.shortcuts.rewards"
          onClick={onClickReward}
        />
        {/* TODO: Handle reinvest in later stages
        <ShortcutButton
          className={cn("flex-1")}
          icon={IconType.Reinvest}
          labelId="UserInfoPanel.shortcuts.reinvest"
          onClick={onClickReinvest}
        /> */}
      </div>
    </div>
  );
};

export { UserInfoPanel };
