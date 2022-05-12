import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DummyScreen from "../components/DummyScreen/DummyScreen";
import HomeScreen from "../components/HomeScreen/HomeScreen";
import AppRoutes from "./AppRoutes";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoutes.Home} element={<HomeScreen />} />
        <Route path={AppRoutes.Dummy} element={<DummyScreen />} />
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
