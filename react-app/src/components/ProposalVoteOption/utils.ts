import { ProposalVoteOption } from "../../generated/graphql";
import { MessageID } from "../../i18n/LocaleModel";

export function getVoteOptionMessage(option: ProposalVoteOption): MessageID {
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
      throw new Error("Unknown vote option");
  }
}

/**
 * Get the tailwindCss background class name for proposal vote option
 * @param option - proposal vote option
 * @returns tailwind background class name
 */
export function getVoteOptionBgCn(option: ProposalVoteOption): string {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "bg-app-vote-color-yes";
    case ProposalVoteOption.Abstain:
      return "bg-app-vote-color-abstain";
    case ProposalVoteOption.No:
      return "bg-app-vote-color-no";
    case ProposalVoteOption.NoWithVeto:
      return "bg-app-vote-color-veto";
    default:
      throw new Error("Unknown vote option");
  }
}

/**
 * Get the tailwindCss text color class name for proposal vote option
 * @param option - proposal vote option
 * @returns tailwind text color class name
 */
export function getVoteOptionTextColorCn(option: ProposalVoteOption): string {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "text-app-vote-color-yes";
    case ProposalVoteOption.Abstain:
      return "text-app-vote-color-abstain";
    case ProposalVoteOption.No:
      return "text-app-vote-color-no";
    case ProposalVoteOption.NoWithVeto:
      return "text-app-vote-color-veto";
    default:
      throw new Error("Unknown vote option");
  }
}
