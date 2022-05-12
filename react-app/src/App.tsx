import React from "react";
import * as Sentry from "@sentry/react";
import AppRouter from "./navigation/AppRouter";
import AppProviders from "./providers/AppProviders";

const App: React.FC = () => {
  return (
    <AppProviders>
      {/* TODO: Handle fallback error screen */}
      <Sentry.ErrorBoundary fallback={<p>Error</p>}>
        <AppRouter />
      </Sentry.ErrorBoundary>
    </AppProviders>
  );
};

export default App;
