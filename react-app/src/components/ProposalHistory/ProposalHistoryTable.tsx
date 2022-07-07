import React from "react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  getVoteOptionTextColorCn,
  getVoteOptionMessage,
} from "../ProposalVoteOption/utils";
import ProposalStatusBadge from "../ProposalStatusBadge/ProposalStatusBadge";
import Table, {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../common/Table/Table";
import { ProposalConnection } from "./ProposalHistoryModel";

interface ProposalHistoryTableProps {
  className?: string;
  data: ProposalConnection;
}

const NoProposal: React.FC = () => (
  <div className={cn("h-52", "flex", "items-center", "justify-center")}>
    <span className={cn("font-bold", "text-xl", "leading-5", "text-black")}>
      <LocalizedText messageID="ProposalScreen.noProposals" />
    </span>
  </div>
);

const ProposalHistoryTable: React.FC<ProposalHistoryTableProps> = ({
  className,
  data,
}) => {
  if (data.totalCount === 0) {
    return <NoProposal />;
  }

  return (
    <Table className={className}>
      <TableHead className="bg-gray-50 border-b border-gray-200">
        <TableRow isHeader={true}>
          <TableHeader className="min-w-[426px]">
            <LocalizedText messageID="ProposalHistory.proposals" />
          </TableHeader>
          <TableHeader>
            <LocalizedText messageID="ProposalHistory.option" />
          </TableHeader>
          <TableHeader>
            <LocalizedText messageID="ProposalHistory.turnout" />
          </TableHeader>
          <TableHeader>
            <LocalizedText messageID="ProposalHistory.comment" />
          </TableHeader>
        </TableRow>
      </TableHead>
      <tbody>
        {data.edges.map(({ node: proposal }) => (
          <TableRow key={proposal.proposalId}>
            <TableCell className="items-center py-4">
              <p className="mb-3 text-sm font-medium leading-5 text-likecoin-green">
                #{proposal.proposalId} {proposal.title}
              </p>
              <ProposalStatusBadge status={proposal.status} />
            </TableCell>
            <TableCell className="items-center py-4">
              {proposal.voteByAddress?.option ? (
                <div
                  className={cn(
                    getVoteOptionTextColorCn(proposal.voteByAddress.option)
                  )}
                >
                  <LocalizedText
                    messageID={getVoteOptionMessage(
                      proposal.voteByAddress.option
                    )}
                  />
                </div>
              ) : (
                <div className="text-gray-500">-</div>
              )}
            </TableCell>
            <TableCell className="items-center py-4 text-black">
              {proposal.turnout
                ? `${(proposal.turnout * 100).toFixed(2)}%`
                : "-"}
            </TableCell>
            <TableCell className="items-center py-4 text-black">0</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default ProposalHistoryTable;
