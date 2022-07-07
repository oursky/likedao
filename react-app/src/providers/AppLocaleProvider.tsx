import React, { ReactNode, useCallback, useMemo } from "react";
import {
  LocaleProvider,
  Context as MFContext,
} from "@oursky/react-messageformat";
import { zhTW, enUS } from "date-fns/locale";
import { Locale as DateFnsLocale } from "date-fns";
import {
  Locale,
  MessageArgs,
  MessageID,
  Translations,
} from "../i18n/LocaleModel";
import { useLocalStorage } from "../hooks/useLocalStorage";

const LOCALE_STORAGE_KEY = "LS/Locale";

interface AppLocaleProviderProps {
  children?: ReactNode;
}

interface LocalizationContextValue {
  setLocale: (locale: Locale) => void;
}

const LocalizationContext = React.createContext<LocalizationContextValue>(
  null as any
);

const localeToDateFnsMap = {
  [Locale.en]: enUS,
  [Locale.zh]: zhTW,
};

const AppLocaleProvider: React.FC<AppLocaleProviderProps> = (props) => {
  const { children } = props;

  const [localePref, setLocalePref] =
    useLocalStorage<string>(LOCALE_STORAGE_KEY);

  const [appLocale, translation] = useMemo(() => {
    switch (localePref) {
      case Locale.en:
        return [Locale.en, Translations[Locale.en]];
      case Locale.zh:
        return [Locale.zh, Translations[Locale.zh]];
      default:
        return [Locale.en, Translations[Locale.en]];
    }
  }, [localePref]);

  const setLocale = useCallback(
    (locale: Locale) => {
      setLocalePref(locale);
    },
    [setLocalePref]
  );

  const contextValue = useMemo<LocalizationContextValue>(
    () => ({
      setLocale,
    }),
    [setLocale]
  );

  return (
    <LocalizationContext.Provider value={contextValue}>
      <LocaleProvider locale={appLocale} messageByID={translation}>
        {children}
      </LocaleProvider>
    </LocalizationContext.Provider>
  );
};

export default AppLocaleProvider;

export const useLocale = (): {
  locale: Locale;
  dateFnsLocale: DateFnsLocale;
  setLocale: (locale: Locale) => void;
  translate: (messageID: MessageID, messageArgs?: MessageArgs) => string;
} => {
  const { locale, renderToString } = React.useContext(MFContext);
  const { setLocale } = React.useContext(LocalizationContext);
  const dateFnsLocale = useMemo(
    () => localeToDateFnsMap[locale as Locale],
    [locale]
  );
  return {
    locale: locale as Locale,
    dateFnsLocale,
    setLocale,
    translate: renderToString,
  };
};
