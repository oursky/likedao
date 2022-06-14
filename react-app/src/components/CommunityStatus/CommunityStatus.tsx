import React from "react";

import { CommunityStatus as ICommunityStatus } from "../OverviewScreen/OverviewScreenModel";
import { CommunityStatusRegular } from "./CommunityStatusRegular";
import { CommunityStatusHeader } from "./CommunityStatusHeader";

export interface CommunityStatusProps {
  className?: string;
  type?: "regular" | "header";
  isLoading: boolean;
  communityStatus: ICommunityStatus | null;
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
