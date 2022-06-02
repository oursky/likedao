import React from "react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import Config from "../../config/Config";
import {
  convertBigNumberToFixedPointString,
  convertBigNumberToLocalizedIntegerString,
} from "../../utils/number";
import { CommunityStatusProps } from "./CommunityStatus";

type CommunityStatusHeaderProps = Omit<CommunityStatusProps, "type">;

export const CommunityStatusHeader: React.FC<CommunityStatusHeaderProps> = (
  props
) => {
  const { className, inflation, bondedRatio, communityPool } = props;
  const chainInfo = Config.chainInfo;

  return (
    <div className={cn("flex", "flex-row", "gap-x-6", className)}>
      <div className={cn("flex", "flex-row", "gap-x-3")}>
        <h1
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-lightgreen"
          )}
        >
          <LocalizedText messageID="CommunityStatus.communityPool" />
        </h1>
        <span
          className={cn(
            "text-md",
            "leading-5",
            "font-medium",
            "text-black",
            "break-all"
          )}
        >
          {convertBigNumberToLocalizedIntegerString(communityPool)}
          <span className={cn("ml-1")}>{chainInfo.currency.coinDenom}</span>
        </span>
      </div>
      <div className={cn("flex", "flex-row", "gap-x-3")}>
        <h1
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-lightgreen"
          )}
        >
          <LocalizedText messageID="CommunityStatus.bondedRatio" />
        </h1>
        <span
          className={cn("text-md", "leading-5", "font-medium", "text-black")}
        >
          {convertBigNumberToFixedPointString(bondedRatio.multipliedBy(100), 2)}
          %
        </span>
      </div>
      <div className={cn("flex", "flex-row", "gap-x-3")}>
        <h1
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-lightgreen"
          )}
        >
          <LocalizedText messageID="CommunityStatus.inflation" />
        </h1>
        <span
          className={cn("text-md", "leading-5", "font-medium", "text-black")}
        >
          {convertBigNumberToFixedPointString(inflation.multipliedBy(100), 2)}%
        </span>
      </div>
    </div>
  );
};
