import React, { useCallback } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../Localized/LocalizedText";
import { useLocale } from "../../providers/AppLocaleProvider";
import { Locale } from "../../i18n/LocaleModel";

const HomeScreen: React.FC = () => {
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

  return (
    <div className={cn("flex", "flex-col")}>
      <LocalizedText messageID="App.title" />

      <Link to={AppRoutes.Dummy}>Go to Dummy Screen</Link>

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

export default HomeScreen;
