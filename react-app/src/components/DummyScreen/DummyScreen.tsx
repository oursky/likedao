import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Profile } from "@desmoslabs/desmjs-types/desmos/profiles/v1beta1/models_profile";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../common/Localized/LocalizedText";
import { Locale } from "../../i18n/LocaleModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import { TestQuery, TestQueryQuery } from "../../generated/graphql";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";

const DummyScreen: React.FC = () => {
  const { setLocale } = useLocale();
  const { desmosQuery } = useQueryClient();
  const wallet = useWallet();

  const [profile, setProfile] = useState<Profile | null>(null);

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

  useEffect(() => {
    // test desmos query client on Oursky portfolio
    if (wallet.status === ConnectionStatus.Connected) {
      desmosQuery
        .getProfile("desmos1ze7n3xsfd7na2saj070v0cx0eu7twng9dxxrlt")
        .then((res) => {
          setProfile(res);
        })
        .catch((err) => console.error("Failed to query desmos profile =", err));
    }
  }, [setProfile, wallet, desmosQuery]);

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
      <pre>
        {JSON.stringify(
          { dtag: profile?.dtag, pictures: profile?.pictures },
          null,
          4
        )}
      </pre>
    </div>
  );
};

export default DummyScreen;
