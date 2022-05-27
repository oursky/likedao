import * as Sentry from "@sentry/react";

export interface IConfig {
  sentry: Pick<
    Sentry.BrowserOptions,
    "dsn" | "environment" | "ignoreErrors"
  > | null;
  graphql: {
    endpoint: string;
  };
}

const defaultConfig: IConfig = {
  sentry: null,
  graphql: {
    endpoint: "http://localhost:8080/graphql",
  },
};

const appConfig = window.appConfig;

const Config: IConfig = {
  ...defaultConfig,
  ...appConfig,
};

export default Config;
