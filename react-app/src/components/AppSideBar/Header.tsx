import React from "react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import { ReactComponent as LikeLogo } from "../../assets/likecoin-logo.svg";
import ChainSwitcher from "./ChainSwitcher/ChainSwitcher";
import { ChainStatus } from "./AppSideBarModel";

interface HeaderProps {
  chainStatus: ChainStatus | null;
  latestBlockHeight: number | null;
}

const Header: React.FC<HeaderProps> = (props) => {
  const { chainStatus, latestBlockHeight } = props;
  return (
    <div
      className={cn(
        "flex-1",
        "flex",
        "flex-row",
        "gap-x-4",
        "items-center",
        "sm:items-start",
        "sm:flex-col",
        "sm:gap-y-4",
        "sm:gap-x-0"
      )}
    >
      <LikeLogo height={48} width={48} />
      <h1
        className={cn(
          "text-base",
          "leading-5",
          "font-normal",
          "whitespace-nowrap",
          "text-app-green"
        )}
      >
        <LocalizedText messageID="AppSideBar.title" />
      </h1>
      <ChainSwitcher
        chainStatus={chainStatus}
        latestBlockHeight={latestBlockHeight}
      />
    </div>
  );
};

export { Header };
