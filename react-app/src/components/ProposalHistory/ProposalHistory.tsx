import React, { useEffect } from "react";
import Paper from "../common/Paper/Paper";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import {
  ProposalHistory as ProposalHistoryModel,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";

interface ProposalHistoryProps {
  data: ProposalHistoryModel;
  address: string;
  tabs: ProposalHistoryTabItem[];
  selectedTab: ProposalHistoryFilterKey;
  onSelectTab: (tab: ProposalHistoryFilterKey) => void;
  onPageChange: (after: number) => void;
}

export type ProposalHistoryTabItem = IFilterTabItem<ProposalHistoryFilterKey>;

const ProposalHistory: React.FC<ProposalHistoryProps> = ({
  data,
  tabs,
  selectedTab,
  onSelectTab,
}) => {
  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <Paper>
      <FilterTabs<ProposalHistoryFilterKey>
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
      />
    </Paper>
  );
};

export default ProposalHistory;
