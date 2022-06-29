import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import ProposalDetailScreen from "./ProposalDetailScreen";

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
          path: ProposalDetailPanelTab.Votes,
          element: <div>votes</div>,
        },
        {
          path: ProposalDetailPanelTab.Deposits,
          element: <div>deposits</div>,
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
