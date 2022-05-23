import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppSideBar from "../components/AppSideBar/AppSideBar";
import DummyScreen from "../components/DummyScreen/DummyScreen";
import OverviewScreen from "../components/OverviewScreen/OverviewScreen";
import AppRoutes from "./AppRoutes";

const AppRouter: React.FC = () => {
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
    </BrowserRouter>
  );
};

export default AppRouter;
