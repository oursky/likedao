import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import { ProposalDepositsPanel } from "./ProposalDepositsPanel";
import ProposalDetailScreen from "./ProposalDetailScreen";
import { ProposalVotesPanel } from "./ProposalVotesPanel";

export enum ProposalDetailPanelTab {
  Votes = "votes",
  Deposits = "deposits",
}

const ProposalDetailRouter: React.FC = () => {
  return useRoutes([
    {
      path: "/",
      element: <ProposalDetailScreen />,
      children: [
        {
          path: "/",
          element: <ProposalVotesPanel />,
        },
        {
          path: ProposalDetailPanelTab.Votes,
          element: <ProposalVotesPanel />,
        },
        {
          path: ProposalDetailPanelTab.Deposits,
          element: <ProposalDepositsPanel />,
        },
        {
          path: "*",
          element: <Navigate to={AppRoutes.NotFound} />,
        },
      ],
    },
  ]);
};

export default ProposalDetailRouter;
