import {
  ProposalStatus,
  ProposalType,
  ProposalVoteOption,
} from "../../generated/graphql";
import { MessageID } from "../../i18n/LocaleModel";
import { BadgeColor } from "../common/Badge/Badge";

export function getProposalStatusBadgeConfig(
  status: ProposalStatus
): [MessageID, BadgeColor] {
  switch (status) {
    case ProposalStatus.Passed:
      return ["Proposal.status.passed", "green"];
    case ProposalStatus.Rejected:
      return ["Proposal.status.rejected", "red"];
    case ProposalStatus.DepositPeriod:
      return ["Proposal.status.depositPeriod", "blue"];
    case ProposalStatus.VotingPeriod:
      return ["Proposal.status.votingPeriod", "yellow"];
    case ProposalStatus.Invalid:
      return ["Proposal.status.invalid", "grey"];
    case ProposalStatus.Failed:
      return ["Proposal.status.failed", "purple"];
    default:
      throw new Error(`Unsupported proposal status`);
  }
}

export function getProposalTypeMessage(type: ProposalType): MessageID {
  switch (type) {
    case ProposalType.Text:
      return "ProposalScreen.proposalType.text";
    case ProposalType.ParameterChange:
      return "ProposalScreen.proposalType.parameterChange";
    case ProposalType.CommunityPoolSpend:
      return "ProposalScreen.proposalType.communityPoolSpend";
    case ProposalType.SoftwareUpgrade:
      return "ProposalScreen.proposalType.softwareUpgrade";
    case ProposalType.CancelSoftwareUpgrade:
      return "ProposalScreen.proposalType.cancelSoftwareUpgrade";
    default:
      throw new Error("Unknown proposal type");
  }
}

export function getVoteOptionMessage(
  option: ProposalVoteOption
): MessageID | null {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "proposal.voteOption.yes";
    case ProposalVoteOption.Abstain:
      return "proposal.voteOption.abstain";
    case ProposalVoteOption.No:
      return "proposal.voteOption.no";
    case ProposalVoteOption.NoWithVeto:
      return "proposal.voteOption.noWithVeto";
    default:
      return null;
  }
}

export function getVoteOptionIndicatorClassname(
  option: ProposalVoteOption
): string | null {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "bg-likecoin-vote-color-yes";
    case ProposalVoteOption.Abstain:
      return "bg-likecoin-vote-color-abstain";
    case ProposalVoteOption.No:
      return "bg-likecoin-vote-color-no";
    case ProposalVoteOption.NoWithVeto:
      return "bg-likecoin-vote-color-veto";
    default:
      return null;
  }
}
