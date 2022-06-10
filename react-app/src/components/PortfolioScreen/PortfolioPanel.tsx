import React, { useEffect, useCallback } from "react";
import cn from "classnames";
import { toast } from "react-toastify";
import Paper from "../common/Paper/Paper";
import { Icon, IconType } from "../common/Icons/Icons";
import { BigNumberCoin } from "../../models/coin";
import CopyableText from "../common/CopyableText/CopyableText";
import { useLocale } from "../../providers/AppLocaleProvider";
import LocalizedText from "../common/Localized/LocalizedText";

export interface Portfolio {
  balance: BigNumberCoin;
  stakingBalance: BigNumberCoin;
  unstakingBalance: BigNumberCoin;
  address: string;
}

// TODO: remove ?
const PortfolioPanel: React.FC<{ portfolio?: Portfolio | null }> = ({
  portfolio,
}) => {
  const { translate } = useLocale();

  const onAddressCopied = useCallback(() => {
    toast.success(translate("UserInfoPanel.addressCopied"));
  }, [translate]);

  useEffect(() => {
    console.log(portfolio);
  }, [portfolio]);

  return (
    <Paper className={cn("py-6", "px-5")}>
      <div className={cn("flex")}>
        <Icon
          className={cn("fill-likecoin-black", "mr-3")}
          icon={IconType.PieChart}
          height={20}
          width={20}
        />
        <h2
          className={cn(
            "text-lg",
            "font-bold",
            "leading-5",
            "text-likecoin-black"
          )}
        >
          <LocalizedText messageID="PortfolioScreen.yourPortfolio" />
        </h2>
      </div>
      <div className={cn("py-6", "sm:flex")}>
        <div className={cn("flex", "justify-center", "mb-9")}>
          {/* <img alt="portfolio pic"/> */}
          <div
            className={cn(
              "flex",
              "justify-center",
              "items-center",
              "bg-likecoin-secondarygreen",
              "rounded-full",
              "w-[120px]",
              "h-[120px]",
              "sm:w-[180px]",
              "sm:h-[180px]",
              "sm:mr-9"
            )}
          >
            <Icon
              icon={IconType.Account}
              className={cn("w-11", "h-11", "sm:w-16", "sm:h-16")}
            />
          </div>
        </div>
        <div className={cn("flex", "flex-col")}>
          <p className={cn("text-xl", "leading-6", "font-medium", "mb-3")}>
            johnnyjohnny
          </p>
          <CopyableText
            className={cn(
              "text-2xs",
              "leading-6",
              "font-medium",
              "text-likecoin-green"
            )}
            containerClassName={cn("shadow-sm", "mb-6")}
            text={portfolio ? portfolio.address : ""}
            onCopied={onAddressCopied}
          />
          <p className={cn("text-2xl", "leading-7")}>7140.16 LIKE</p>
          <p
            className={cn(
              "text-sm",
              "leading-5",
              "font-medium",
              "text-likecoin-lightgreen"
            )}
          >
            7140.1624921
          </p>
          <div className={cn("flex", "justify-between", "mt-3")}>
            <div className={cn("flex", "flex-col")}>
              <p
                className={cn(
                  "text-likecoin-lightgreen",
                  "text-sm",
                  "leading-5",
                  "font-medium"
                )}
              >
                <LocalizedText messageID="PortfolioScreen.stake" />
              </p>
              <p className={cn("text-base", "leading-5", "font-medium")}>
                99.8 LIKE
              </p>
            </div>
            <div className={cn("flex", "flex-col")}>
              <p
                className={cn(
                  "text-likecoin-lightgreen",
                  "text-sm",
                  "leading-5",
                  "font-medium"
                )}
              >
                <LocalizedText messageID="PortfolioScreen.unstaking" />
              </p>
              <p className={cn("text-base", "leading-5", "font-medium")}>
                99.8 LIKE
              </p>
            </div>
            <div className={cn("flex", "flex-col")}>
              <p
                className={cn(
                  "text-likecoin-lightgreen",
                  "text-sm",
                  "leading-5",
                  "font-medium"
                )}
              >
                <LocalizedText messageID="PortfolioScreen.available" />
              </p>
              <p className={cn("text-base", "leading-5", "font-medium")}>
                99.8 LIKE
              </p>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default PortfolioPanel;
