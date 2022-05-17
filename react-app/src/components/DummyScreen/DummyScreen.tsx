import React, { useCallback } from "react";
import cn from "classnames";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../common/Localized/LocalizedText";
import { Locale } from "../../i18n/LocaleModel";
import { useLocale } from "../../providers/AppLocaleProvider";

const DummyScreen: React.FC = () => {
  const { setLocale } = useLocale();

  const setLocaleToZh = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setLocale(Locale.zh);
    },
    [setLocale]
  );

  const setLocaleToEn = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setLocale(Locale.en);
    },
    [setLocale]
  );

  const captureDummyError = useCallback(() => {
    Sentry.captureException(new Error("This is my fake error message"));
  }, []);

  return (
    <div className={cn("flex", "flex-col")}>
      <LocalizedText messageID="App.title" />

      <button type="button" onClick={captureDummyError}>
        Click to send error to sentry
      </button>

      <Link to={AppRoutes.Overview}>Go to Overview Screen</Link>

      <div className={cn("flex", "flex-row", "gap-2")}>
        <button type="button" onClick={setLocaleToZh}>
          Set locale to zh
        </button>
        <button type="button" onClick={setLocaleToEn}>
          Set locale to en
        </button>
      </div>
    </div>
  );
};

export default DummyScreen;
