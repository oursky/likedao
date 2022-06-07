import React from "react";
import { Navigate, useParams } from "react-router-dom";
import cn from "classnames";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();

  if (!id) return <Navigate to={AppRoutes.Proposals} />;

  return (
    <div className={cn("flex", "flex-col")}>
      <Paper>#{id} Proposal Summary Placeholder</Paper>
      <Paper>Description Placeholder</Paper>
      <Paper>Votes and Deposit Placeholder</Paper>
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
