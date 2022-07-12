import React from "react";
import cn from "classnames";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import Paper from "../common/Paper/Paper";
import ColorBar, { makeColorBarData } from "../common/ColorBar/ColorBar";
import PageContoller from "../common/PageController/PageController";
import {
  ProposalHistory as ProposalHistoryModel,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";
import ProposalHistoryTable from "./ProposalHistoryTable";

export type ProposalHistoryTabItem = IFilterTabItem<ProposalHistoryFilterKey>;

interface ProposalHistoryProps {
  data: ProposalHistoryModel;
  selectedTab: ProposalHistoryFilterKey;
  onSelectTab: (tab: ProposalHistoryFilterKey) => void;
  pageSize: number;
  currentOffset: number;
  onPageChange: (after: number) => void;
}

export const PROPOSAL_HISTORY_PAGE_SIZE = 2;

export const filterItems: ProposalHistoryTabItem[] = [
  {
    value: "voted",
    label: "ProposalHistory.filters.voted",
  },
  {
    value: "submitted",
    label: "ProposalHistory.filters.submitted",
  },
  {
    value: "deposited",
    label: "ProposalHistory.filters.deposited",
  },
];

const ProposalHistory: React.FC<ProposalHistoryProps> = ({
  data,
  selectedTab,
  onSelectTab,
  pageSize,
  currentOffset,
  onPageChange,
}) => {
  const { proposals, proposalVotesDistribution } = data;
  return (
    <Paper>
      <FilterTabs<ProposalHistoryFilterKey>
        className="mb-4"
        tabs={filterItems}
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
      />

      {selectedTab === "voted" && (
        <div className={cn("h-11")}>
          <ColorBar
            data={makeColorBarData(proposalVotesDistribution)}
            showPercentage={true}
            className={cn("rounded-full")}
          />
        </div>
      )}

      <ProposalHistoryTable className="my-4 min-w-full" data={proposals} />

      <PageContoller
        offsetBased={true}
        pageSize={pageSize}
        totalItems={proposals.totalCount}
        currentOffset={currentOffset}
        onPageChange={onPageChange}
      />
    </Paper>
  );
};

export default ProposalHistory;
