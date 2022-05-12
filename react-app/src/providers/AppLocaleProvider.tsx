import React, { ReactNode, useMemo, useState } from "react";
import {
  LocaleProvider,
  Context as MFContext,
} from "@oursky/react-messageformat";
import {
  Locale,
  MessageArgs,
  MessageID,
  Translations,
} from "../i18n/LocaleModel";

interface AppLocaleProviderProps {
  children?: ReactNode;
}

const AppLocaleProvider: React.FC<AppLocaleProviderProps> = (props) => {
  const { children } = props;

  // TODO: keep user local settings
  const [locale, _setLocale] = useState<Locale>(Locale.en);
  const translation = useMemo(() => {
    return Translations[locale];
  }, [locale]);

  return (
    <LocaleProvider locale={locale} messageByID={translation}>
      {children}
    </LocaleProvider>
  );
};

export default AppLocaleProvider;

export const useLocale = (): {
  locale: Locale;
  translate: (messageID: MessageID, messageArgs?: MessageArgs) => string;
} => {
  const { locale, renderToString } = React.useContext(MFContext);
  return {
    locale: locale as Locale,
    translate: renderToString,
  };
};
