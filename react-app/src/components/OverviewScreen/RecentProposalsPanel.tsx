import React from "react";
import Paper from "../common/Paper/Paper";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";
import { ProposalList } from "../proposals/ProposalList";
import { Proposal } from "../proposals/ProposalModel";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";

interface ActiveProposalsPanelProps {
  proposals: Proposal[];
}

const ActiveProposalsPanel: React.FC<ActiveProposalsPanelProps> = ({
  proposals,
}) => {
  return (
    <Paper className="mb-0">
      <div className="flex items-center">
        <Icon icon={IconType.Vote} className="mr-3 fill-app-black" />
        <h2 className="text-lg font-bold leading-none">
          <LocalizedText messageID="OverviewScreen.recentProposals" />
        </h2>
      </div>
      <ProposalList proposals={proposals} className="py-4" />
      <div className="flex flex-col items-center">
        <AppButton
          type="link"
          messageID="OverviewScreen.activeProposals.viewMore"
          theme="secondary"
          size="regular"
          to={AppRoutes.Proposals}
        />
      </div>
    </Paper>
  );
};

export default ActiveProposalsPanel;
