import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DummyScreen from "../components/DummyScreen/DummyScreen";
import AppRoutes from "./AppRoutes";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoutes.Dummy} element={<DummyScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
