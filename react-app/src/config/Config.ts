import * as Sentry from "@sentry/react";

export interface IConfig {
  sentry: Pick<
    Sentry.BrowserOptions,
    "dsn" | "environment" | "ignoreErrors"
  > | null;
}

const defaultConfig: IConfig = {
  sentry: null,
};

const appConfig = window.appConfig;

const Config: IConfig = {
  ...defaultConfig,
  ...appConfig,
};

export default Config;
