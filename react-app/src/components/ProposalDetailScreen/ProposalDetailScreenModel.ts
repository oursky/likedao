import { ProposalDetailScreenProposalFragment } from "../../generated/graphql";
import { ReactionType } from "../reactions/ReactionModel";

export interface ReactionItem {
  type: ReactionType;
  count: number;
}
export interface Proposal
  extends Omit<ProposalDetailScreenProposalFragment, "reactions"> {
  /**
   * Turn out rate in percentages
   */
  turnout: number;
  /**
   * Number of days left until voting closes
   * null when voting dates are not yet available
   */
  remainingVotingDays: number | null;

  reactions: ReactionItem[];
}
