import { ProposalDetailScreenProposalFragment } from "../../generated/graphql";
import { ReactionType } from "../reactions/ReactionModel";

export interface ReactionItem {
  type: ReactionType;
  count: number;
}
export interface Proposal
  extends Omit<
    ProposalDetailScreenProposalFragment,
    | "votingStartTime"
    | "votingEndTime"
    | "depositEndTime"
    | "submitTime"
    | "reactions"
  > {
  votingStartTime: Date | null;
  votingEndTime: Date | null;
  depositEndTime: Date | null;
  submitTime: Date;
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
