import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateProposalScreen from "../components/CreateProposalScreen/CreateProposalScreen";
import DummyScreen from "../components/DummyScreen/DummyScreen";
import ErrorView, { ErrorType } from "../components/ErrorView/ErrorView";
import OverviewScreen from "../components/OverviewScreen/OverviewScreen";
import PortfolioScreen from "../components/PortfolioScreen/PortfolioScreen";
import ProposalDetailScreen from "../components/ProposalDetailScreen/ProposalDetailScreen";
import ProposalScreen from "../components/ProposalScreen/ProposalScreen";
import WalletConnectingScreen from "../components/WalletConnectingScreen/WalletConnectingScreen";
import { useWallet, ConnectionStatus } from "../providers/WalletProvider";
import AppScaffold from "../components/AppScaffold/AppScaffold";
import AppRoutes from "./AppRoutes";

const AppRouter: React.FC = () => {
  const wallet = useWallet();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppScaffold />}>
          <Route path={AppRoutes.Overview} element={<OverviewScreen />} />
          <Route path={AppRoutes.Dummy} element={<DummyScreen />} />
          <Route path={AppRoutes.Proposals} element={<ProposalScreen />} />
          <Route
            path={AppRoutes.NewProposal}
            element={<CreateProposalScreen />}
          />
          <Route
            path={AppRoutes.ProposalDetail}
            element={<ProposalDetailScreen />}
          />
          <Route path={AppRoutes.YourPortfolio} element={<PortfolioScreen />} />
          <Route path={AppRoutes.Portfolio} element={<PortfolioScreen />} />
        </Route>

        <Route
          path={AppRoutes.ErrorInvalidAddress}
          element={<ErrorView type={ErrorType.InvalidAddress} />}
        />
        <Route path="*" element={<ErrorView type={ErrorType.NotFound} />} />
      </Routes>

      {wallet.status === ConnectionStatus.Connecting && (
        <WalletConnectingScreen />
      )}
    </BrowserRouter>
  );
};

export default AppRouter;
