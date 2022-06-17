import { ProposalDetailScreenProposalFragment } from "../../generated/graphql";

export interface Proposal extends ProposalDetailScreenProposalFragment {
  /**
   * Turn out rate in percentages
   */
  turnout: number;
  /**
   * Number of days left until voting closes
   * null when voting dates are not yet available
   */
  remainingVotingDays: number | null;
}
