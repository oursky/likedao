import { Coin, MsgSubmitProposalEncodeObject } from "@cosmjs/stargate";

import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";

import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";

import { CommunityPoolSpendProposalWithDeposit } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";

import {
  SoftwareUpgradeProposal,
  CancelSoftwareUpgradeProposal,
} from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";
import { Any } from "cosmjs-types/google/protobuf/any";

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

export { makeSubmitProposalMessage };
