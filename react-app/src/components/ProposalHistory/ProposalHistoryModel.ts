import {
  ProposalHistoryProposalVotesDistributionFragment as ProposalVotesDistribution,
  ProposalHistoryProposalFragmentFragment as Proposal,
} from "../../generated/graphql";

export type ProposalHistoryFilterKey = "voted" | "submitted" | "deposited";

export interface ProposalHistory {
  proposalVotesDistribution: ProposalVotesDistribution;
  proposals: Proposal[];
  totalProposalCount: number;
}

export type { Proposal };
