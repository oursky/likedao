import React, { useEffect } from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import ColorBar, { makeColorBarData } from "../common/ColorBar/ColorBar";
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
        className="mb-4"
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
      />
      {selectedTab === "voted" && (
        <div className={cn("h-11")}>
          <ColorBar
            data={makeColorBarData(data.proposalVotesDistribution)}
            showPercentage={true}
            className={cn("rounded-full")}
          />
        </div>
      )}
    </Paper>
  );
};

export default ProposalHistory;
