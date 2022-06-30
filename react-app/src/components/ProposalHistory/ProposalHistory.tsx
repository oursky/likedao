import React from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import ColorBar, { makeColorBarData } from "../common/ColorBar/ColorBar";
import PageContoller from "../common/PageController/PageController";
import {
  ProposalHistory as ProposalHistoryModel,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";
import ProposalHistoryTable from "./ProposalHistoryTable";

interface ProposalHistoryProps {
  data: ProposalHistoryModel;
  address: string;
  tabs: ProposalHistoryTabItem[];
  selectedTab: ProposalHistoryFilterKey;
  onSelectTab: (tab: ProposalHistoryFilterKey) => void;
  pageSize: number;
  currentOffset: number;
  onPageChange: (after: number) => void;
}

export type ProposalHistoryTabItem = IFilterTabItem<ProposalHistoryFilterKey>;

const ProposalHistory: React.FC<ProposalHistoryProps> = ({
  data,
  tabs,
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
        tabs={tabs}
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
