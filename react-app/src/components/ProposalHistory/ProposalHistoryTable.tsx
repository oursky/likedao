import React from "react";
import BigNumber from "bignumber.js";
import cn from "classnames";
import { convertBigNumberToFixedPointString } from "../../utils/number";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  getVoteOptionTextColorCn,
  getVoteOptionMessage,
} from "../ProposalVoteOption/utils";
import ProposalStatusBadge from "../ProposalStatusBadge/ProposalStatusBadge";
import { ProposalConnection } from "./ProposalHistoryModel";

interface ProposalHistoryTableProps {
  className?: string;
  data: ProposalConnection;
}

const tableHeaderClassNames = cn(
  "font-medium",
  "tracking-wider",
  "leading-4",
  "uppercase",
  "text-xs",
  "py-3",
  "px-6",
  "text-left",
  "text-likecoin-green"
);

const NoProposal: React.FC = () => (
  <div className={cn("h-96", "flex", "items-center", "justify-center")}>
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
    <table className={cn("rounded-lg shadow-md", className)}>
      <thead className={cn("bg-gray-50", "border-b-[1px]", "border-gray-200")}>
        <tr>
          <th className={tableHeaderClassNames}>
            <LocalizedText messageID="ProposalHistory.proposals" />
          </th>
          <th className={tableHeaderClassNames}>
            <LocalizedText messageID="ProposalHistory.option" />
          </th>
          <th className={tableHeaderClassNames}>
            <LocalizedText messageID="ProposalHistory.turnout" />
          </th>
          <th className={tableHeaderClassNames}>
            <LocalizedText messageID="ProposalHistory.comment" />
          </th>
        </tr>
      </thead>
      <tbody>
        {data.edges.map(({ node: proposal }) => (
          <tr
            className="text-sm font-normal leading-5 text-gray-500"
            key={proposal.proposalId}
          >
            <td className="items-center py-4 px-6 max-w-md">
              <p className="mb-3 text-sm font-medium leading-5 text-likecoin-green">
                #{proposal.proposalId} {proposal.title}
              </p>
              <ProposalStatusBadge status={proposal.status} />
            </td>
            {proposal.myVote?.option ? (
              <td
                className={cn(
                  "items-center",
                  "py-4",
                  "px-6",
                  getVoteOptionTextColorCn(proposal.myVote.option)
                )}
              >
                <LocalizedText
                  messageID={getVoteOptionMessage(proposal.myVote.option)}
                />
              </td>
            ) : (
              <td
                className={cn("items-center", "py-4", "px-6", "text-gray-500")}
              >
                -
              </td>
            )}
            <td className="items-center py-4 px-6 text-black">
              {proposal.turnout ? (
                `${convertBigNumberToFixedPointString(
                  (proposal.turnout as BigNumber).times(100),
                  2
                )}%`
              ) : (
                <LocalizedText messageID="ProposalHistory.na" />
              )}
            </td>
            <td className="items-center py-4 px-6 text-black">0</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProposalHistoryTable;
