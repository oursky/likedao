import React, { useMemo } from "react";
import cn from "classnames";
import { Outlet, matchPath, useLocation } from "react-router-dom";
import Paper from "../common/Paper/Paper";
import NavigationTab, { INavigationTabItem } from "../Tabs/NavigationTabs";
import AppRoutes from "../../navigation/AppRoutes";
import { Proposal } from "./ProposalDetailScreenModel";
import { ProposalDetailPanelTab } from "./ProposalDetailRouter";
interface ProposalDataProps {
  proposal: Proposal;
}

const ProposalData: React.FC<ProposalDataProps> = (props) => {
  const { proposal } = props;
  const location = useLocation();

  const activeTab = useMemo(() => {
    switch (true) {
      case Boolean(
        matchPath(
          `${AppRoutes.ProposalDetail}/${ProposalDetailPanelTab.Votes}`,
          location.pathname
        )
      ):
        return ProposalDetailPanelTab.Votes;
      case Boolean(
        matchPath(
          `${AppRoutes.ProposalDetail}/${ProposalDetailPanelTab.Deposits}`,
          location.pathname
        )
      ):
        return ProposalDetailPanelTab.Deposits;
      default:
        return ProposalDetailPanelTab.Votes;
    }
  }, [location]);

  // Declaring this inside the component to prevent lexical declaration error
  const proposalDetailDataNavigationTabs = useMemo(
    (): INavigationTabItem[] => [
      {
        label: "ProposalDetail.votes",
        route: ProposalDetailPanelTab.Votes,
      },
      {
        label: "ProposalDetail.deposits",
        route: ProposalDetailPanelTab.Deposits,
      },
    ],
    []
  );

  return (
    <Paper>
      <div className={cn("flex", "flex-col", "gap-y-4")}>
        <NavigationTab
          tabs={proposalDetailDataNavigationTabs}
          activeTab={activeTab}
        />
        <Outlet context={proposal} />
      </div>
    </Paper>
  );
};

export { ProposalData };
