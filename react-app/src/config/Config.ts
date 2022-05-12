export interface IConfig {}

const defaultConfig: IConfig = {};

const appConfig = window.appConfig;

const Config: IConfig = {
  ...defaultConfig,
  ...appConfig,
};

export default Config;
