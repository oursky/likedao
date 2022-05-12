import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../Localized/LocalizedText";

const HomeScreen: React.FC = () => {
  return (
    <div className={cn("flex", "flex-col")}>
      <LocalizedText messageID="App.title" />

      <Link to={AppRoutes.Dummy}>Go to Dummy Screen</Link>
    </div>
  );
};

export default HomeScreen;
