import React, { useMemo } from "react";
import BigNumber from "bignumber.js";
import { CommunityStatus as ICommunityStatus } from "../../generated/graphql";
import Config from "../../config/Config";
import { CommunityStatusRegular } from "./CommunityStatusRegular";
import { CommunityStatusHeader } from "./CommunityStatusHeader";

export interface CommunityStatusProps {
  className?: string;
  type?: "regular" | "header";
  communityStatus: ICommunityStatus;
}

const CommunityStatus: React.FC<CommunityStatusProps> = (props) => {
  const { type, communityStatus, ...rest } = props;
  const chainInfo = Config.chainInfo;

  const [inflation, bondedRatio, communityPoolAmount] = useMemo((): [
    BigNumber,
    BigNumber,
    BigNumber
  ] => {
    const { inflation, bondedRatio, communityPool } = communityStatus;

    const chainCurrency = communityPool.find(
      (c) => c.denom === chainInfo.currency.coinMinimalDenom
    );

    return [inflation, bondedRatio, chainCurrency?.amount ?? new BigNumber(0)];
  }, [chainInfo.currency.coinMinimalDenom, communityStatus]);

  switch (type) {
    case "header":
      return (
        <CommunityStatusHeader
          {...rest}
          inflation={inflation}
          bondedRatio={bondedRatio}
          communityPool={communityPoolAmount}
        />
      );
    case "regular":
    default:
      return (
        <CommunityStatusRegular
          {...rest}
          inflation={inflation}
          bondedRatio={bondedRatio}
          communityPool={communityPoolAmount}
        />
      );
  }
};

export default CommunityStatus;
