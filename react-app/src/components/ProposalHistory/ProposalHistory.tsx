import React from "react";
import { IFilterTabItem } from "../Tabs/FilterTabs";
import Paper from "../common/Paper/Paper";
import {
  ProposalHistory as ProposalHistoryModel,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";

export type ProposalHistoryTabItem = IFilterTabItem<ProposalHistoryFilterKey>;

interface ProposalHistoryProps {
  data: ProposalHistoryModel;
  tabs: ProposalHistoryTabItem[];
  selectedTab: ProposalHistoryFilterKey;
  onSelectTab: (tab: ProposalHistoryFilterKey) => void;
  pageSize: number;
  currentOffset: number;
  onPageChange: (after: number) => void;
}

const ProposalHistory: React.FC<ProposalHistoryProps> = ({}) => {
  return <Paper></Paper>;
};

export default ProposalHistory;
