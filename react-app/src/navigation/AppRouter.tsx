import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppSideBar from "../components/AppSideBar/AppSideBar";
import DummyScreen from "../components/DummyScreen/DummyScreen";
import OverviewScreen from "../components/OverviewScreen/OverviewScreen";
import WalletConnectingScreen from "../components/WalletConnectingScreen/WalletConnectingScreen";
import { useWallet, ConnectionStatus } from "../providers/WalletProvider";
import AppRoutes from "./AppRoutes";

const AppRouter: React.FC = () => {
  const wallet = useWallet();
  return (
    <BrowserRouter>
      <AppSideBar>
        <Routes>
          <Route path={AppRoutes.Overview} element={<OverviewScreen />} />
          <Route path={AppRoutes.Dummy} element={<DummyScreen />} />

          {/* TODO: Handle 404 screen  */}
          <Route path="*" element={<OverviewScreen />} />
        </Routes>
      </AppSideBar>
      {wallet.status === ConnectionStatus.Connecting && (
        <WalletConnectingScreen />
      )}
    </BrowserRouter>
  );
};

export default AppRouter;
