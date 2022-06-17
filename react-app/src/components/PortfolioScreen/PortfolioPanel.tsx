import React from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";
import { Portfolio } from "./PortfolioScreenModel";

interface PortfolioPanelProps {
  portfolio: Portfolio;
}

const ProfilePicture: React.FC<{ profile: Portfolio["profile"] }> = ({
  profile,
}) => {
  const profilePicture = profile?.pictures?.profile;

  return (
    <div className={cn("flex", "justify-center", "mb-9")}>
      {profilePicture ? (
        <img
          className={cn(
            "rounded-full",
            "w-[120px]",
            "h-[120px]",
            "sm:w-[180px]",
            "sm:h-[180px]",
            "sm:mr-9",
            "object-cover"
          )}
          src={profilePicture}
          alt="profile picture"
        />
      ) : (
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
      )}
    </div>
  );
};

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ portfolio }) => {
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
      <div className={cn("mt-11", "mb-6", "sm:flex")}>
        <ProfilePicture profile={portfolio.profile} />
      </div>
    </Paper>
  );
};

export default PortfolioPanel;
