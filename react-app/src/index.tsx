import React from "react";
import { Buffer } from "buffer";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./App";
import Config from "./config/Config";

import "./index.scss";

window.Buffer = Buffer;

if (Config.sentry != null) {
  const { dsn, environment, ignoreErrors } = Config.sentry;
  Sentry.init({
    dsn,
    ignoreErrors,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0,
    environment: environment ?? "react-app",
  });
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
