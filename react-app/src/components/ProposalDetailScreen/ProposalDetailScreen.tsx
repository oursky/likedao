import React from "react";
import cn from "classnames";
import { Navigate, useParams } from "react-router-dom";
import {
  Proposal,
  ProposalStatus,
  ProposalType,
} from "../../generated/graphql";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import ProposalHeader from "./ProposalHeader";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();

  if (!id) return <Navigate to={AppRoutes.Proposals} />;

  // mock data, remove after API integration
  const proposal: Proposal = {
    id,
    description: "description",
    type: ProposalType.Text,
    proposerAddress: "like1ewpwcdfgsdfdu0jj2unwhjjl58yshm9xnvr9c2",
    status: ProposalStatus.VotingPeriod,
    title:
      "Community-pool-spend Proposal: deposit 2,000,000 LIKE to Tech Subdao multisig wallet",
    depositEndTime: new Date(),
    submitTime: new Date(),
    votingEndTime: new Date("2022-06-20"),
    votingStartTime: new Date("2022-06-01"),
    depositTotal: 100000,
    tallyResult: {
      yes: 1,
      no: 1,
      abstain: 1,
      noWithVeto: 0,
    },
  };

  return (
    <div className={cn("flex", "flex-col")}>
      <ProposalHeader proposal={proposal} />
      <Paper>Description Placeholder</Paper>
      <Paper>Votes and Deposit Placeholder</Paper>
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
