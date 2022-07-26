import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import Paper from "../common/Paper/Paper";
import ColorBar, { makeColorBarData } from "../common/ColorBar/ColorBar";
import PageContoller from "../common/PageController/PageController";
import * as Table from "../common/Table";
import AppRoutes from "../../navigation/AppRoutes";
import ProposalStatusBadge from "../proposals/ProposalStatusBadge";
import {
  getVoteOptionMessage,
  getVoteOptionTextColorCn,
} from "../ProposalVoteOption/utils";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  Proposal,
  ProposalHistory as ProposalHistoryModel,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";

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
  const { proposals, proposalVotesDistribution, totalProposalCount } = data;
  return (
    <Paper className={cn("flex", "flex-col", "gap-y-4")}>
      <FilterTabs<ProposalHistoryFilterKey>
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

      <Table.Table
        items={proposals}
        emptyMessageID="ProposalScreen.noProposals"
      >
        <Table.Column<Proposal>
          id="proposal"
          titleId="ProposalHistory.proposals"
        >
          {(item) => (
            <div className={cn("flex", "flex-col", "items-start")}>
              <Link
                to={AppRoutes.ProposalDetail.replace(
                  ":id",
                  item.proposalId.toString()
                )}
                className="mb-3 text-sm font-medium leading-5 text-app-green"
              >
                #{item.proposalId} {item.title}
              </Link>
              <ProposalStatusBadge status={item.status} />
            </div>
          )}
        </Table.Column>

        <Table.Column<Proposal> id="option" titleId="ProposalHistory.option">
          {(item) => {
            return item.voteByAddress?.option ? (
              <div
                className={cn(
                  getVoteOptionTextColorCn(item.voteByAddress.option)
                )}
              >
                <LocalizedText
                  messageID={getVoteOptionMessage(item.voteByAddress.option)}
                />
              </div>
            ) : (
              <div className="text-gray-500">-</div>
            );
          }}
        </Table.Column>
        <Table.Column<Proposal> id="turnout" titleId="ProposalHistory.turnout">
          {(item) => (
            <span
              className={cn(
                "text-sm",
                "leading-5",
                "font-normal",
                "text-app-black"
              )}
            >
              {item.turnout ? `${(item.turnout * 100).toFixed(2)}%` : "-"}
            </span>
          )}
        </Table.Column>
        <Table.Column<Proposal> id="comment" titleId="ProposalHistory.comment">
          {(_) => (
            <span
              className={cn(
                "text-sm",
                "leading-5",
                "font-normal",
                "text-app-black"
              )}
            >
              0
            </span>
          )}
        </Table.Column>
      </Table.Table>

      <PageContoller
        offsetBased={true}
        pageSize={pageSize}
        totalItems={totalProposalCount}
        currentOffset={currentOffset}
        onPageChange={onPageChange}
      />
    </Paper>
  );
};

export default ProposalHistory;
