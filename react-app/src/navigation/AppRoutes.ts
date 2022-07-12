const AppRoutes = Object.freeze({
  Dummy: "/dummy",
  Overview: "/",
  Proposals: "/proposals",
  ProposalDetail: "/proposals/:id",
  NewProposal: "/proposals/new",
  Validator: "/validators",
  ValidatorDetail: "validators/:address",
  Portfolio: "/portfolio",
  OtherPortfolio: "/portfolio/:address",
  ErrorInvalidAddress: "/invalid-address",
  NotFound: "/not-found",
});

export default AppRoutes;
