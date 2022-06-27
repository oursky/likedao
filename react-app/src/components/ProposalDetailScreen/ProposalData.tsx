import React from "react";
import Paper from "../common/Paper/Paper";
import TallyResultIndicator from "../TallyResultIndicator/TallyResultIndicator";
import { Proposal } from "./ProposalDetailScreenModel";

interface ProposalDataProps {
  proposal: Proposal;
}

const ProposalData: React.FC<ProposalDataProps> = (props) => {
  const { proposal } = props;

  return (
    <Paper>
      <TallyResultIndicator proposal={proposal} />
    </Paper>
  );
};

export { ProposalData };
