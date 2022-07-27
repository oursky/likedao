import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  convertBigNumberToLocalizedString,
  convertBigNumberToMillifiedIntegerString,
  convertBigNumberToFixedPointString,
} from "../../utils/number";
import Config from "../../config/Config";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import { CommunityStatusProps } from "./CommunityStatus";

interface CommunityStatusPanelProps {
  className?: string;
  isLoading: boolean;
  titleId: MessageID;
  children?: React.ReactNode;
}

const CommunityStatusPanel: React.FC<CommunityStatusPanelProps> = (props) => {
  const { className, titleId, isLoading, children } = props;
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
      {isLoading ? (
        <LoadingSpinner className={cn("h-16", "w-full")} />
      ) : (
        children
      )}
    </div>
  );
};

type CommunityStatusRegularProps = Omit<CommunityStatusProps, "type">;

export const CommunityStatusRegular: React.FC<CommunityStatusRegularProps> = (
  props
) => {
  const { className, isLoading, communityStatus } = props;
  const chainInfo = Config.chainInfo;

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "gap-y-3",
        "desktop:gap-x-3",
        "desktop:flex-row",
        "flex-wrap",
        className
      )}
    >
      <CommunityStatusPanel
        className={cn("flex-1")}
        isLoading={isLoading}
        titleId="CommunityStatus.communityPool"
      >
        {communityStatus?.communityPool != null && (
          <div className={cn("flex", "flex-col", "gap-y-1")}>
            <span
              className={cn(
                "text-3xl",
                "leading-9",
                "font-semibold",
                "text-gray-900"
              )}
            >
              {convertBigNumberToMillifiedIntegerString(
                communityStatus.communityPool.amount
              )}

              <span className={cn("ml-1", "text-xs", "leading-3")}>
                {chainInfo.currency.coinDenom}
              </span>
            </span>
            <span
              className={cn(
                "text-xs",
                "leading-3",
                "font-semibold",
                "text-app-darkgrey"
              )}
            >
              {convertBigNumberToLocalizedString(
                communityStatus.communityPool.amount
              )}
            </span>
          </div>
        )}
      </CommunityStatusPanel>
      <CommunityStatusPanel
        className={cn("flex-1")}
        isLoading={isLoading}
        titleId="CommunityStatus.bondedRatio"
      >
        {communityStatus?.bondedRatio != null && (
          <span
            className={cn(
              "text-3xl",
              "leading-9",
              "font-semibold",
              "text-gray-900"
            )}
          >
            {convertBigNumberToFixedPointString(
              communityStatus.bondedRatio.multipliedBy(100),
              2
            )}
            %
          </span>
        )}
      </CommunityStatusPanel>
      <CommunityStatusPanel
        className={cn("flex-1")}
        isLoading={isLoading}
        titleId="CommunityStatus.inflation"
      >
        {communityStatus?.inflation != null && (
          <span
            className={cn(
              "text-3xl",
              "leading-9",
              "font-semibold",
              "text-gray-900"
            )}
          >
            {convertBigNumberToFixedPointString(
              communityStatus.inflation.multipliedBy(100),
              2
            )}
            %
          </span>
        )}
      </CommunityStatusPanel>
    </div>
  );
};
