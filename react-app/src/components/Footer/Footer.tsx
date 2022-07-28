import React from "react";
import cn from "classnames";
import Divider from "../common/Divider/Divider";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import Config from "../../config/Config";

const Footer: React.FC = () => {
  return (
    <div className={cn("mx-3", "mt-10", "desktop:mt-8", "mb-8")}>
      <Divider />
      <div
        className={cn(
          "mt-8",
          "text-center",
          "text-sm",
          "leading-5",
          "font-normal",
          "items-center",
          "text-gray-500",
          "desktop:flex",
          "desktop:justify-between",
          "desktop:mt-5"
        )}
      >
        <div
          className={cn("flex", "flex-col", "items-center", "desktop:flex-row")}
        >
          <p className={cn("desktop:grow", "desktop:text-left")}>
            <LocalizedText messageID="footer.license" />
          </p>

          <AppButton
            theme="secondary"
            size="small"
            type="anchor"
            href={Config.footerLinks.githubLink}
            messageID="footer.github"
            className={cn(
              "text-sm",
              "capitalize",
              "leading-4",
              "font-medium",
              "text-app-darkgrey",
              "m-3"
            )}
          />
        </div>
        <div
          className={cn(
            "flex",
            "flex-col",
            "items-center",
            "mt-3",
            "desktop:flex-row",
            "desktop:mt-0"
          )}
        >
          <p
            className={cn(
              Config.footerLinks.tokenLinks.length <= 0 && "hidden"
            )}
          >
            <LocalizedText messageID="footer.getToken" />
          </p>
          <div
            className={cn(
              "flex",
              "justify-center",
              "items-center",
              "my-3",
              "desktop:px-3"
            )}
          >
            {Config.footerLinks.tokenLinks.map((token) => (
              <AppButton
                key={token.name}
                theme="secondary"
                size="small"
                type="anchor"
                href={token.link}
                className={cn(
                  "text-sm",
                  "capitalize",
                  "leading-4",
                  "font-medium",
                  "text-app-darkgrey",
                  "m-0.5"
                )}
              >
                {token.name}
              </AppButton>
            ))}
          </div>
          {Config.footerLinks.contactSupport != null && (
            <div
              className={cn(
                "flex",
                "justify-center",
                "items-center",
                "my-3",
                "desktop:px-3"
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
                href={Config.footerLinks.contactSupport}
                className={cn(
                  "text-sm",
                  "leading-4",
                  "font-medium",
                  "text-app-darkgrey"
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;
