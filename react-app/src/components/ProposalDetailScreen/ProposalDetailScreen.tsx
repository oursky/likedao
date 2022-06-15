import React, { useEffect } from "react";
import cn from "classnames";
import { Navigate, useParams } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import { RequestStateType } from "../../models/RequestState";
import ProposalHeader from "./ProposalHeader";
import ProposalDescription from "./ProposalDescription";
import { useProposalQuery } from "./ProposalScreenAPI";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();
  const { fetch, requestState } = useProposalQuery(`proposal_${id}`);

  useEffect(() => {
    if (id) {
      fetch(id);
    }
  }, [fetch, id]);

  if (!id) return <Navigate to={AppRoutes.Proposals} />;
  if (requestState.type !== RequestStateType.Loaded) return null;

  const proposal = requestState.data;

  if (!proposal) return <Navigate to={AppRoutes.Proposals} />;

  return (
    <div className={cn("flex", "flex-col")}>
      <ProposalHeader proposal={proposal} />
      <ProposalDescription proposal={proposal} />
      <Paper>Votes and Deposit Placeholder</Paper>
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
