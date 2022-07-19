import React, { useMemo } from "react";
import cn from "classnames";
import { Icon, IconType } from "../../common/Icons/Icons";
import LocalizedText from "../../common/Localized/LocalizedText";
import { ChainStatus as IChainStatus } from "../AppSideBarModel";

interface ChainStatusProps {
  chainId: string;
  latestBlockHeight: number | null;
  chainStatus: IChainStatus | null;
}

function getStatusColour(status: IChainStatus) {
  switch (status) {
    case IChainStatus.Online:
      return "bg-app-vote-color-yes";
    case IChainStatus.Congested:
      // Pending design for congested colour
      return "bg-yellow-400";
    case IChainStatus.Halted:
      return "bg-app-vote-color-no";
    default:
      throw new Error("Unknown chain status");
  }
}

const ChainStatus: React.FC<ChainStatusProps> = (props) => {
  const { chainId, chainStatus, latestBlockHeight } = props;

  const [statusColor, displayedHeight] = useMemo(() => {
    if (!chainStatus || !latestBlockHeight) return [null, null];
    return [getStatusColour(chainStatus), latestBlockHeight.toLocaleString()];
  }, [chainStatus, latestBlockHeight]);

  return (
    <div className={cn("flex", "flex-row", "gap-x-2", "items-center")}>
      <div
        className={cn(
          "h-1.5",
          "w-1.5",
          "rounded-full",
          "inline-block",
          statusColor ?? "bg-gray-400"
        )}
      ></div>
      <div
        className={cn(
          "flex",
          "flex-col",
          "text-left",
          "sm:gap-x-2",
          "sm:flex-row"
        )}
      >
        <span
          className={cn(
            "text-xs",
            "leading-5",
            "font-normal",
            "text-ellipsis",
            "overflow-hidden",
            "break-all",
            "whitespace-nowrap",
            "text-app-green"
          )}
        >
          {chainId}
        </span>
        <span
          className={cn(
            "text-xs",
            "leading-5",
            "font-normal",
            "text-app-green"
          )}
        >
          {displayedHeight ?? (
            <LocalizedText messageID="ChainStatus.connecting" />
          )}
        </span>
      </div>

      <Icon icon={IconType.DropDown} />
    </div>
  );
};

export { ChainStatus };
