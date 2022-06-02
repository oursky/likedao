import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  convertBigNumberToLocalizedIntegerString,
  convertBigNumberToMillifiedIntegerString,
  convertBigNumberToFixedPointString,
} from "../../utils/number";
import Config from "../../config/Config";
import { CommunityStatusProps } from "./CommunityStatus";

interface CommunityStatusPanelProps {
  className?: string;
  titleId: MessageID;
  children?: React.ReactNode;
}

const CommunityStatusPanel: React.FC<CommunityStatusPanelProps> = (props) => {
  const { className, titleId, children } = props;
  return (
    <div
      className={cn(
        "drop-shadow",
        "bg-white",
        "rounded-lg",
        "flex",
        "flex-col",
        "gap-y-1",
        "p-6",
        "items-start",
        className
      )}
    >
      <h1
        className={cn("text-sm", "leading-5", "font-medium", "text-gray-500")}
      >
        <LocalizedText messageID={titleId} />
      </h1>
      {children}
    </div>
  );
};

type CommunityStatusRegularProps = Omit<CommunityStatusProps, "type">;

export const CommunityStatusRegular: React.FC<CommunityStatusRegularProps> = (
  props
) => {
  const { className, inflation, bondedRatio, communityPool } = props;
  const chainInfo = Config.chainInfo;

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "gap-y-3",
        "sm:gap-y-0",
        "sm:gap-x-3",
        "sm:flex-row",
        className
      )}
    >
      <CommunityStatusPanel
        className={cn("flex-1")}
        titleId="CommunityStatus.communityPool"
      >
        <div className={cn("flex", "flex-col", "gap-y-1")}>
          <span
            className={cn(
              "text-3xl",
              "leading-9",
              "font-semibold",
              "text-gray-900",
              "break-all"
            )}
          >
            {convertBigNumberToMillifiedIntegerString(communityPool)}

            <span className={cn("ml-1", "text-xs", "leading-3")}>
              {chainInfo.currency.coinDenom}
            </span>
          </span>
          <span
            className={cn(
              "text-xs",
              "leading-3",
              "font-semibold",
              "text-likecoin-darkgrey"
            )}
          >
            {convertBigNumberToLocalizedIntegerString(communityPool)}
          </span>
        </div>
      </CommunityStatusPanel>
      <CommunityStatusPanel
        className={cn("flex-1")}
        titleId="CommunityStatus.bondedRatio"
      >
        <span
          className={cn(
            "text-3xl",
            "leading-9",
            "font-semibold",
            "text-gray-900"
          )}
        >
          {convertBigNumberToFixedPointString(bondedRatio.multipliedBy(100), 2)}
          %
        </span>
      </CommunityStatusPanel>
      <CommunityStatusPanel
        className={cn("flex-1")}
        titleId="CommunityStatus.inflation"
      >
        <span
          className={cn(
            "text-3xl",
            "leading-9",
            "font-semibold",
            "text-gray-900"
          )}
        >
          {convertBigNumberToFixedPointString(inflation.multipliedBy(100), 2)}%
        </span>
      </CommunityStatusPanel>
    </div>
  );
};
