import { ProposalDetailScreenProposalFragment } from "../../generated/graphql";

export interface Proposal extends ProposalDetailScreenProposalFragment {
  /**
   * Turn out rate in percentages
   */
  turnout: number;
  /**
   * Number of days left until voting closes
   * -1 when voting dates are not yet available
   */
  remainingVotingDays: number;
}
