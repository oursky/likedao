import BigNumber from "bignumber.js";
import {
  ProposalDetailScreenProposalFragment,
  ProposalDetailProposalVoteFragment as ProposalVoteFragment,
  ProposalDetailProposalDepositFragment as ProposalDepositFragment,
  ProposalDetailProposalVoteVoterFragment as ProposalVoteVoterFragment,
  ProposalDetailProposalDepositDepositorFragment as ProposalDepositDepositorFragment,
} from "../../generated/graphql";
import { BigNumberCoin } from "../../models/coin";
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
    | "votes"
    | "deposits"
    | "depositTotal"
  > {
  votingStartTime: Date | null;
  votingEndTime: Date | null;
  depositEndTime: Date | null;
  submitTime: Date;
  /**
   * Turn out rate in percentages
   */
  turnout: number | null;
  /**
   * Number of days left until voting closes
   * null when voting dates are not yet available
   */
  remainingVotingDays: number | null;

  reactions: ReactionItem[];

  depositTotal: BigNumber;
}

export type ProposalVoteVoter = ProposalVoteVoterFragment;
export type ProposalDepositDepositor = ProposalDepositDepositorFragment;
export type ProposalVote = ProposalVoteFragment;
export interface ProposalDeposit
  extends Omit<ProposalDepositFragment, "amount"> {
  amount: BigNumberCoin;
}
export interface PaginatedProposalVotes {
  pinnedVotes: ProposalVoteFragment[];
  votes: ProposalVoteFragment[];
  totalCount: number;
}

export interface PaginatedProposalDeposits {
  pinnedDeposits: ProposalDeposit[];
  deposits: ProposalDeposit[];
  totalCount: number;
}
