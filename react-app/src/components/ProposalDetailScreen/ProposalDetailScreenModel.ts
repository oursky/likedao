import { ProposalDetailScreenProposalFragment } from "../../generated/graphql";

export interface Proposal extends ProposalDetailScreenProposalFragment {
  /**
   * Turn out rate in percentages
   */
  turnout: number;
}
