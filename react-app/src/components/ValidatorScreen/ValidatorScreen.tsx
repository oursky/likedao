import React from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

const ValidatorScreen: React.FC = () => {
  return (
    <Paper>
      <div className={cn("flex", "flex-row", "gap-x-2.5", "items-center")}>
        <Icon
          icon={IconType.Validator}
          fill="currentColor"
          height={24}
          width={24}
          className={cn("text-app-black")}
        />
        <h1
          className={cn(
            "text-lg",
            "leading-none",
            "font-bold",
            "text-app-black"
          )}
        >
          <LocalizedText messageID="ValidatorScreen.title" />
        </h1>
      </div>
    </Paper>
  );
};

export default ValidatorScreen;
