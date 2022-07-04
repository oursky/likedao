import {
  Coin,
  MsgSubmitProposalEncodeObject,
  MsgVoteEncodeObject,
  MsgDepositEncodeObject,
} from "@cosmjs/stargate";

import {
  MsgSubmitProposal,
  MsgVote,
  MsgDeposit,
} from "cosmjs-types/cosmos/gov/v1beta1/tx";

import {
  TextProposal,
  voteOptionFromJSON,
} from "cosmjs-types/cosmos/gov/v1beta1/gov";

import { Duration } from "cosmjs-types/google/protobuf/duration";

import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";

import { CommunityPoolSpendProposalWithDeposit } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";

import {
  SoftwareUpgradeProposal,
  CancelSoftwareUpgradeProposal,
} from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Decimal } from "@cosmjs/math";
import { BigNumberCoin } from "../coin";

export enum ProposalStatus {
  Unspecified = "PROPOSAL_STATUS_UNSPECIFIED",
  DepositPeriod = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  VotingPeriod = "PROPOSAL_STATUS_VOTING_PERIOD",
  Passed = "PROPOSAL_STATUS_PASSED",
  Rejected = "PROPOSAL_STATUS_REJECTED",
  Failed = "PROPOSAL_STATUS_FAILED",
  Invalid = "PROPOSAL_STATUS_INVALID",
}

export enum ProposalType {
  Signaling = "Signaling",
  ParameterChange = "ParameterChange",
  CommunityPoolSpend = "CommunityPoolSpend",
  SoftwareUpgrade = "SoftwareUpgrade",
  CancelSoftwareUpgrade = "CancelSoftwareUpgrade",
}

export enum VoteOption {
  Abstain = "VOTE_OPTION_ABSTAIN",
  No = "VOTE_OPTION_NO",
  NoWithVeto = "VOTE_OPTION_NO_WITH_VETO",
  Yes = "VOTE_OPTION_YES",
}

interface TextProposalContentBody {
  type: ProposalType.Signaling;
  proposal: TextProposal;
}

interface ParameterChangeProposalContentBody {
  type: ProposalType.ParameterChange;
  proposal: ParameterChangeProposal;
}

interface CommunityPoolSpendProposalContentBody {
  type: ProposalType.CommunityPoolSpend;
  proposal: CommunityPoolSpendProposalWithDeposit;
}

interface SoftwareUpgradeProposalContentBody {
  // TODO: Update software proposal when upgrade to v0.46
  type: ProposalType.SoftwareUpgrade;
  proposal: SoftwareUpgradeProposal;
}

interface CancelSoftwareUpgradeProposalContentBody {
  // TODO: Update software proposal when upgrade to v0.46
  type: ProposalType.CancelSoftwareUpgrade;
  proposal: CancelSoftwareUpgradeProposal;
}

export type ProposalContentBody =
  | TextProposalContentBody
  | ParameterChangeProposalContentBody
  | CommunityPoolSpendProposalContentBody
  | SoftwareUpgradeProposalContentBody
  | CancelSoftwareUpgradeProposalContentBody;

function makeProposalContent(body: ProposalContentBody): {
  typeUrl: string;
  value: Uint8Array;
} {
  switch (body.type) {
    case ProposalType.Signaling:
      return {
        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
        value: Uint8Array.from(TextProposal.encode(body.proposal).finish()),
      };
    case ProposalType.ParameterChange:
      return {
        typeUrl: "/cosmos.params.v1beta1.ParameterChangeProposal",
        value: Uint8Array.from(
          ParameterChangeProposal.encode(body.proposal).finish()
        ),
      };
    case ProposalType.CommunityPoolSpend:
      return {
        typeUrl:
          "/cosmos.distribution.v1beta1.CommunityPoolSpendProposalWithDeposit",
        value: Uint8Array.from(
          CommunityPoolSpendProposalWithDeposit.encode(body.proposal).finish()
        ),
      };
    case ProposalType.SoftwareUpgrade:
      return {
        typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        value: Uint8Array.from(
          SoftwareUpgradeProposal.encode(body.proposal).finish()
        ),
      };
    case ProposalType.CancelSoftwareUpgrade:
      return {
        typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
        value: Uint8Array.from(
          CancelSoftwareUpgradeProposal.encode(body.proposal).finish()
        ),
      };
    default:
      throw new Error(`Unsupported proposal type`);
  }
}

interface SubmitProposalMessageBody {
  content: ProposalContentBody;
  initialDeposit: Coin[];
  proposer: string;
}

function makeSubmitProposalMessage(
  body: SubmitProposalMessageBody
): MsgSubmitProposalEncodeObject {
  const content = Any.fromPartial(makeProposalContent(body.content));

  return {
    typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
    value: MsgSubmitProposal.fromPartial({
      content,
      proposer: body.proposer,
      initialDeposit: body.initialDeposit,
    }),
  };
}

interface VoteMessageBody {
  proposalId: number;
  voter: string;
  option: VoteOption;
}

function makeVoteMessage(body: VoteMessageBody): MsgVoteEncodeObject {
  return {
    typeUrl: "/cosmos.gov.v1beta1.MsgVote",
    value: MsgVote.fromPartial({
      proposalId: body.proposalId,
      voter: body.voter,
      option: voteOptionFromJSON(body.option),
    }),
  };
}

interface DepositeMessageBody {
  proposalId: number;
  depositor: string;
  amount: Coin[];
}

function makeDepositMessage(body: DepositeMessageBody): MsgDepositEncodeObject {
  return {
    typeUrl: "/cosmos.gov.v1beta1.MsgDeposit",
    value: MsgDeposit.fromPartial({
      proposalId: body.proposalId,
      depositor: body.depositor,
      amount: body.amount,
    }),
  };
}

export { makeSubmitProposalMessage, makeVoteMessage, makeDepositMessage };
export interface DepositParams {
  minDeposit: BigNumberCoin;
  maxDepositPeriod: Duration;
}

/**
 * TallyParams defines the params for tallying votes on governance proposals.
 * results are returned in percentages
 */
export interface TallyParams {
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   *  considered valid.
   */
  quorum: Decimal;
  /** Minimum proportion of Yes votes for proposal to pass. Default value: 0.5. */
  threshold: Decimal;
  /**
   * Minimum value of Veto votes to Total votes ratio for proposal to be
   *  vetoed. Default value: 1/3.
   */
  vetoThreshold: Decimal;
}

export interface VotingParams {
  votingPeriod: Duration;
}

export interface GovParams {
  deposit: DepositParams;
  tally: TallyParams;
  voting: VotingParams;
}
