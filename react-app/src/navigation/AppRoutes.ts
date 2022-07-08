const AppRoutes = Object.freeze({
  Dummy: "/dummy",
  Overview: "/",
  Proposals: "/proposals",
  ProposalDetail: "/proposals/:id",
  NewProposal: "/proposals/new",
  Validator: "/validator",
  ValidatorDetail: "validator/:address",
  Portfolio: "/portfolio",
  OtherPortfolio: "/portfolio/:address",
  ErrorInvalidAddress: "/invalid-address",
  NotFound: "/not-found",
});

export default AppRoutes;
