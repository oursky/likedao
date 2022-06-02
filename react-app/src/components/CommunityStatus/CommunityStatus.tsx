import React from "react";
import BigNumber from "bignumber.js";

import { CommunityStatusRegular } from "./CommunityStatusRegular";
import { CommunityStatusHeader } from "./CommunityStatusHeader";

export interface CommunityStatusProps {
  className?: string;
  type?: "regular" | "header";
  inflation: BigNumber;
  bondedRatio: BigNumber;
  communityPool: BigNumber;
}

const CommunityStatus: React.FC<CommunityStatusProps> = (props) => {
  const { type, ...rest } = props;

  switch (type) {
    case "header":
      return <CommunityStatusHeader {...rest} />;
    case "regular":
    default:
      return <CommunityStatusRegular {...rest} />;
  }
};

export default CommunityStatus;
