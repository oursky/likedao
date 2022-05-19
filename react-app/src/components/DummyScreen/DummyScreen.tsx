import React, { useCallback } from "react";
import cn from "classnames";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";

const DummyScreen: React.FC = () => {
  const captureDummyError = useCallback(() => {
    Sentry.captureException(new Error("This is my fake error message"));
  }, []);

  return (
    <div className={cn("flex", "flex-col", "items-start")}>
      <Link to={AppRoutes.Home}>Go to Home Screen</Link>

      <button type="button" onClick={captureDummyError}>
        Click to send error to sentry
      </button>
    </div>
  );
};

export default DummyScreen;
