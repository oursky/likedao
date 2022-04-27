import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";

const DummyScreen: React.FC = () => {
  return (
    <div className={cn("flex", "flex-column")}>
      <Link to={AppRoutes.Home}>Go to Home Screen</Link>
    </div>
  );
};

export default DummyScreen;
