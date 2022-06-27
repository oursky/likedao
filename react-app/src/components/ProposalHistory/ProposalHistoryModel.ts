import {
  PortfolioHistoryProposalVotesDistributionFragment as ProposalVotesDistribution,
  PortfolioHistoryProposalConnectionFragment as ProposalConnection,
} from "../../generated/graphql";

export interface ProposalHistory {
  proposalVotesDistribution: ProposalVotesDistribution;
  proposals: ProposalConnection;
}
