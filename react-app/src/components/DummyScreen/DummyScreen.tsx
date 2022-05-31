import React, { useCallback } from "react";
import cn from "classnames";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../common/Localized/LocalizedText";
import { Locale } from "../../i18n/LocaleModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import { TestQuery, TestQueryQuery } from "../../generated/graphql";

const DummyScreen: React.FC = () => {
  const { setLocale } = useLocale();

  // Fetch block height every 6 seconds (i.e average block time)
  const { loading, data, error } = useQuery<TestQueryQuery>(TestQuery, {
    pollInterval: 6000,
  });

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Failed to fetch data</div>;
  }

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-start",
        "justify-between",
        "gap-y-5"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-col",
          "items-start",

          "gap-y-5"
        )}
      >
        <LocalizedText messageID="App.title" />

        <h1>
          Block Height: <span>{data?.latestBlock?.height ?? -1}</span>
        </h1>
      </div>
      <div className={cn("flex", "flex-col", "gap-y-5")}>
        <button
          type="button"
          className={cn(
            "bg-likecoin-green",
            "text-white",
            "hover:bg-likecoin-lightgreen",
            "text-base",
            "leading-6",
            "font-medium",
            "py-3",
            "px-6",
            "rounded-md",
            "shadow-sm",
            "rounded-md"
          )}
          onClick={captureDummyError}
        >
          Click to send error to sentry
        </button>

        <div className={cn("flex", "flex-row", "gap-2")}>
          <button
            type="button"
            className={cn(
              "bg-likecoin-green",
              "text-white",
              "hover:bg-likecoin-lightgreen",
              "text-base",
              "leading-6",
              "font-medium",
              "py-3",
              "px-6",
              "rounded-md",
              "shadow-sm",
              "rounded-md"
            )}
            onClick={setLocaleToZh}
          >
            Set locale to zh
          </button>
          <button
            type="button"
            className={cn(
              "bg-likecoin-green",
              "text-white",
              "hover:bg-likecoin-lightgreen",
              "text-base",
              "leading-6",
              "font-medium",
              "py-3",
              "px-6",
              "rounded-md",
              "shadow-sm",
              "rounded-md"
            )}
            onClick={setLocaleToEn}
          >
            Set locale to en
          </button>
        </div>

        <Link
          to={AppRoutes.Overview}
          className={cn(
            "bg-likecoin-green",
            "text-white",
            "hover:bg-likecoin-lightgreen",
            "text-base",
            "leading-6",
            "font-medium",
            "py-3",
            "px-6",
            "rounded-md",
            "shadow-sm",
            "rounded-md"
          )}
        >
          Go to Overview Screen
        </Link>
      </div>
    </div>
  );
};

export default DummyScreen;
