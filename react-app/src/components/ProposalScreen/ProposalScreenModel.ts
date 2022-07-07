import { Proposal } from "../proposals/ProposalModel";

export interface PaginatedProposals {
  proposals: Proposal[];
  totalCount: number;
}
