import React, { useMemo } from "react";
import { ProposalStatus } from "../../generated/graphql";
import Badge from "../common/Badge/Badge";
import LocalizedText from "../common/Localized/LocalizedText";
import { getProposalStatusBadgeConfig } from "./utils";

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
}

const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  status,
}) => {
  const [messageID, color] = useMemo(
    () => getProposalStatusBadgeConfig(status),
    [status]
  );

  return (
    <Badge color={color}>
      <LocalizedText messageID={messageID} />
    </Badge>
  );
};

export default ProposalStatusBadge;
