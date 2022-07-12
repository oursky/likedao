import {
  ProposalHistoryProposalVotesDistributionFragment as ProposalVotesDistribution,
  ProposalHistoryProposalConnectionFragment as ProposalConnection,
} from "../../generated/graphql";

export type ProposalHistoryFilterKey = "voted" | "submitted" | "deposited";

export interface ProposalHistory {
  proposalVotesDistribution: ProposalVotesDistribution;
  proposals: ProposalConnection;
}

export type { ProposalConnection };
