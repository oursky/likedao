import React, { useMemo } from "react";
import cn from "classnames";
import {
  ChainHealth,
  ChainStatus as ChainStatusStatus,
} from "../../generated/graphql";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

interface ChainStatusProps {
  chainId: string;
  chainHealth?: ChainHealth;
}

function getStatusColour(status: ChainStatusStatus) {
  switch (status) {
    case ChainStatusStatus.Online:
      return "bg-likecoin-vote-color-yes";
    case ChainStatusStatus.Congested:
      // Pending design for congested colour
      return "bg-yellow-400";
    case ChainStatusStatus.Offline:
      return "bg-likecoin-vote-color-no";
    default:
      throw new Error("Unknown chain status");
  }
}

const ChainStatus: React.FC<ChainStatusProps> = (props) => {
  const { chainId, chainHealth } = props;

  const [statusColor, displayedHeight] = useMemo(() => {
    if (chainHealth == null) return [null, null];

    return [
      getStatusColour(chainHealth.status),
      chainHealth.height.toLocaleString(),
    ];
  }, [chainHealth]);

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
            "text-likecoin-green"
          )}
        >
          {chainId}
        </span>
        <span
          className={cn(
            "text-xs",
            "leading-5",
            "font-normal",
            "text-likecoin-green"
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
