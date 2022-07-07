import { ProposalScreenProposalFragment } from "../../generated/graphql";
import { ReactionType } from "../reactions/ReactionModel";

export interface ReactionItem {
  type: ReactionType;
  count: number;
}

export interface Proposal
  extends Omit<ProposalScreenProposalFragment, "reactions"> {
  reactions: ReactionItem[];
}
