import React, { useCallback, useState } from "react";
import cn from "classnames";
import * as Sentry from "@sentry/react";
import { Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../common/Localized/LocalizedText";
import { Locale } from "../../i18n/LocaleModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import {
  TestQuery,
  TestQueryQuery,
  MeQuery,
  MeQueryQuery,
} from "../../generated/graphql";
import { useAuth } from "../../providers/AuthProvider";
import AppButton from "../common/Buttons/AppButton";
import * as Table from "../common/Table";

interface DummyTableItem {
  identity: {
    name: string;
    role: string;
  };
  value: string;
}

const dummyTableItems: Table.SectionItem<DummyTableItem>[] = [
  {
    titleId: "AppSideBar.navigation.overview",
    className: cn("bg-app-secondarygreen", "text-app-green"),
    items: [
      {
        identity: {
          name: "John Doe",
          role: "Developer",
        },
        value: "NO",
      },
      {
        identity: {
          name: "Sam Tsui",
          role: "Developer",
        },
        value: "Yes",
      },
    ],
  },
  {
    titleId: "AppSideBar.navigation.portfolio",
    className: cn("bg-[#F0ECDA]", "text-[#666666]"),
    items: [
      {
        identity: {
          name: "John Doe",
          role: "Developer",
        },
        value: "NO",
      },
      {
        identity: {
          name: "Sam Tsui",
          role: "Developer",
        },
        value: "Yes",
      },
    ],
  },
];

const DummyScreen: React.FC = () => {
  const { setLocale } = useLocale();
  const auth = useAuth();

  const [dummyTableSort, setDummyTableSort] =
    useState<Table.ColumnOrder | null>(null);

  // Fetch block height every 6 seconds (i.e average block time)
  const { data } = useQuery<TestQueryQuery>(TestQuery, {
    pollInterval: 6000,
  });

  const onDummyItemClick = useCallback((item: DummyTableItem) => {
    return () => {
      console.log(item);
    };
  }, []);

  const [loadMe, { loading: meLoading, data: meData, error: meError }] =
    useLazyQuery<MeQueryQuery>(MeQuery, {});

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

  const signInWithCosmos = useCallback(async () => {
    await auth.signInWithCosmos();
  }, [auth]);

  const loadUserInfo = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const captureDummyError = useCallback(() => {
    Sentry.captureException(new Error("This is my fake error message"));
  }, []);

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

        {data && (
          <h1>
            Block Height: <span>{data.latestBlock?.height ?? -1}</span>
          </h1>
        )}
      </div>
      <div className={cn("flex", "flex-col", "gap-y-5")}>
        <button
          type="button"
          className={cn(
            "bg-app-green",
            "text-white",
            "hover:bg-app-lightgreen",
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
              "bg-app-green",
              "text-white",
              "hover:bg-app-lightgreen",
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
              "bg-app-green",
              "text-white",
              "hover:bg-app-lightgreen",
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
            "bg-app-green",
            "text-white",
            "hover:bg-app-lightgreen",
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

      <div className={cn("flex", "flex-row", "gap-x-2")}>
        <button
          type="button"
          className={cn(
            "bg-app-green",
            "text-white",
            "hover:bg-app-lightgreen",
            "text-base",
            "leading-6",
            "font-medium",
            "py-3",
            "px-6",
            "rounded-md",
            "shadow-sm",
            "rounded-md"
          )}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={signInWithCosmos}
        >
          Sign In With Cosmos
        </button>
        <button
          type="button"
          className={cn(
            "bg-app-green",
            "text-white",
            "hover:bg-app-lightgreen",
            "text-base",
            "leading-6",
            "font-medium",
            "py-3",
            "px-6",
            "rounded-md",
            "shadow-sm",
            "rounded-md"
          )}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={loadUserInfo}
        >
          Get User Info
        </button>
      </div>
      {meLoading && <div>Signing In...</div>}

      {meData && <div>Signed In As: {meData.me}</div>}

      {meError && <div>Failed to sign in: {meError.message}</div>}

      <Table.SectionedTable
        sections={dummyTableItems}
        sortOrder={dummyTableSort ?? undefined}
        onSort={setDummyTableSort}
      >
        <Table.Column<DummyTableItem>
          id="title"
          titleId="App.title"
          sortable={true}
        >
          {(item) => (
            <div className={cn("flex", "flex-col", "gap-y-2")}>
              <span className={cn("font-bold")}>{item.identity.name}</span>
              <span>{item.identity.role}</span>
            </div>
          )}
        </Table.Column>
        <Table.Column<DummyTableItem>
          id="name"
          titleId="App.title"
          sortable={true}
        >
          {(item) => <span className={cn("text-app-green")}>{item.value}</span>}
        </Table.Column>
        <Table.Column<DummyTableItem> id="action" className={cn("text-right")}>
          {(item) => (
            <AppButton
              theme="primary"
              size="regular"
              messageID="AppSideBar.title"
              onClick={onDummyItemClick(item)}
            />
          )}
        </Table.Column>
      </Table.SectionedTable>
    </div>
  );
};

export default DummyScreen;
