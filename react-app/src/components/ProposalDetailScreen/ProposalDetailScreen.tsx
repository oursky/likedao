import React from "react";
import cn from "classnames";
import { Navigate, useParams } from "react-router-dom";
import {
  Proposal,
  ProposalStatus,
  ProposalType,
  ProposalVoteOption,
} from "../../generated/graphql";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import ProposalHeader from "./ProposalHeader";
import ProposalDescription from "./ProposalDescription";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();

  if (!id) return <Navigate to={AppRoutes.Proposals} />;

  const proposal: Proposal = {
    id: `proposal_${id}`,
    proposalId: parseInt(id, 10),
    description:
      "# About\n\nWith the passing of Proposal 38, marketing subdao is formed by Phoebe (Phoebe#4357, Liker land team) and Cheung To（tocheung#3755, https://www.youtube.com/channel/UC-tHPfxMbXkM099YxK8pjmw）and created a 2-of-2 multisig wallet cosmos19qxpdaq4j08a2pra3llvt00faahmjxxnkrsusa. By voting YES to this proposal, you agree to send 1,000,000 LIKE to the Marketing Subdao multisig wallet as the initial fund allocated to the marketing development of LikeCoin.\n\n# Background\n\nSem adipiscing pellentesque quam quisque massa purus netus integer lorem. Magna justo, gravida est tristique. Sit nulla sed sed lacinia augue mi, auctor accumsan. Varius libero arcu condimentum pulvinar. Scelerisque morbi urna, ultrices venenatis. Tincidunt aliquet diam at turpis morbi varius lectus condimentum. Dolor consectetur facilisis nibh purus ultrices sed. Tortor, tortor aenean ornare nisl, morbi erat. Netus et ut volutpat, tortor, sapien, ut sit. Accumsan, dignissim ut quisque cursus urna nec euismod vestibulum id. Sed diam vulputate egestas diam praesent arcu nulla vitae aenean. Ac vulputate fermentum donec quis tristique mauris sit. Fringilla sed pulvinar cursus elit venenatis malesuada. Blandit netus sit leo, vehicula amet viverra arcu. Mi rhoncus dui vitae turpis quis pellentesque viverra.\nEt magna ullamcorper pharetra pellentesque. Sagittis tortor pharetra, nulla porta pellentesque ornare posuere. Urna massa non aenean sit. Aliquam neque, sagittis egestas iaculis felis, proin scelerisque nisl. Et et feugiat quis nulla velit. Neque interdum id lacinia venenatis, a. Iaculis nullam etiam diam risus turpis dolor urna. Tellus convallis faucibus sed tincidunt.\nBlandit nunc aliquet elementum nisi, scelerisque eu sed in. Volutpat platea odio tincidunt neque pretium vitae amet lectus velit. Sollicitudin sed consequat dictum sapien. Urna leo egestas nisi pulvinar semper tincidunt. In dictum nullam risus elit at egestas. Neque, et, elit ante neque. Tellus nisl odio velit ornare dolor, elementum egestas at. Eros facilisi integer adipiscing eget aliquam imperdiet sit a. Dictumst rutrum posuere nisi id sem vel, eget. Amet, tempor leo sit tortor sit. Eu, integer commodo facilisi scelerisque gravida ornare id et. Neque sit tortor eros, lobortis adipiscing purus ac proin. Mi purus ullamcorper commodo magna mi vitae in. Posuere velit pharetra dui lacus enim, mi, amet lorem. Eleifend nunc a eros curabitur.\n",
    type: ProposalType.Text,
    proposerAddress: "like1ewpwcdfgsdfdu0jj2unwhjjl58yshm9xnvr9c2",
    status: ProposalStatus.VotingPeriod,
    title:
      "Community-pool-spend Proposal: deposit 2,000,000 LIKE to Tech Subdao multisig wallet",
    depositEndTime: new Date(),
    submitTime: new Date(),
    votingEndTime: new Date("2022-06-20"),
    votingStartTime: new Date("2022-06-01"),
    tallyResult: {
      yes: 1,
      no: 1,
      abstain: 1,
      noWithVeto: 0,
      mostVoted: ProposalVoteOption.Yes,
    },
  };

  return (
    <div className={cn("flex", "flex-col")}>
      <ProposalHeader proposal={proposal} />
      <ProposalDescription proposal={proposal} />
      <Paper>Votes and Deposit Placeholder</Paper>
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
