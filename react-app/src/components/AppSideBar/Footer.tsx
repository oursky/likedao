import React from "react";
import cn from "classnames";
import Divider from "../common/Divider/Divider";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";

const Footer: React.FC = () => {
  return (
    <div className={cn("mx-11", "mt-9", "sm:mt-8", "mb-16")}>
      <Divider />
      <div
        className={cn(
          "mt-8",
          "text-center",
          "text-sm",
          "leading-5",
          "font-normal",
          "text-gray-500",
          "sm:flex",
          "sm:items-center",
          "sm:mt-5"
        )}
      >
        <p className={cn("sm:grow", "sm:text-left")}>
          © {new Date().getFullYear()}{" "}
          <LocalizedText messageID="footer.likecoin" />
        </p>
        <p className={cn("mt-6", "sm:mt-0")}>
          <LocalizedText messageID="footer.getToken" />
        </p>
        <div
          className={cn(
            "flex",
            "justify-center",
            "items-center",
            "my-3",
            "sm:px-3"
          )}
        >
          <AppButton
            messageID="footer.osmosis"
            theme="secondary"
            size="small"
            type="anchor"
            href="https://app.osmosis.zone/?from=ATOM&to=LIKE"
            className={cn(
              "text-sm",
              "leading-4",
              "font-medium",
              "text-likecoin-darkgrey",
              "m-0.5"
            )}
          />
          <AppButton
            messageID="footer.liquid"
            theme="secondary"
            size="small"
            type="anchor"
            href="https://app.liquid.com/exchange/LIKEUSDT"
            className={cn(
              "text-sm",
              "leading-4",
              "font-medium",
              "text-likecoin-darkgrey",
              "m-0.5"
            )}
          />
          <AppButton
            messageID="footer.emeris"
            theme="secondary"
            size="small"
            type="anchor"
            href="https://app.emeris.com/welcome"
            className={cn(
              "text-sm",
              "leading-4",
              "font-medium",
              "text-likecoin-darkgrey",
              "m-0.5"
            )}
          />
        </div>
        <div
          className={cn(
            "flex",
            "justify-center",
            "items-center",
            "my-3",
            "sm:px-3"
          )}
        >
          <p className={cn("pr-3")}>
            <LocalizedText messageID="footer.needHelp" />
          </p>
          <AppButton
            messageID="footer.contactSupport"
            theme="secondary"
            size="small"
            type="anchor"
            href="https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7"
            className={cn(
              "text-sm",
              "leading-4",
              "font-medium",
              "text-likecoin-darkgrey"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
