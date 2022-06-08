import { ProposalScreenProposalFragment as Proposal } from "../../generated/graphql";

export interface PaginatedProposals {
  proposals: Proposal[];
  totalCount: number;
}
