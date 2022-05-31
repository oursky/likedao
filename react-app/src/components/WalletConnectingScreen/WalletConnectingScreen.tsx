import React from "react";
import cn from "classnames";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

const WalletConnectingScreen: React.FC = () => {
  return (
    <div
      className={cn(
        "fixed",
        "left-0",
        "top-0",
        "w-full",
        "h-full",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "bg-black",
        "opacity-50",
        "z-30",
        "gap-y-4"
      )}
    >
      <Icon
        className={cn("text-white")}
        icon={IconType.Lightning}
        height={48}
        width={48}
      />
      <span className={cn("text-xs", "leading-4", "font-medium", "text-white")}>
        <LocalizedText messageID="ConnectWallet.connecting" />
      </span>
    </div>
  );
};

export default WalletConnectingScreen;
