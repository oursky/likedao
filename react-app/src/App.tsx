import React from "react";
import * as Sentry from "@sentry/react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./navigation/AppRouter";
import AppProviders from "./providers/AppProviders";
import "react-toastify/dist/ReactToastify.css";
import ErrorView from "./components/ErrorView/ErrorView";

const App: React.FC = () => {
  return (
    <AppProviders>
      <Sentry.ErrorBoundary fallback={<ErrorView />}>
        <AppRouter />
        <ToastContainer
          closeButton={true}
          closeOnClick={false}
          position={"top-right"}
          hideProgressBar={true}
        />
      </Sentry.ErrorBoundary>
    </AppProviders>
  );
};

export default App;
