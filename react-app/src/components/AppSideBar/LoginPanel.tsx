import React from "react";

import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import AppButton from "../common/Buttons/AppButton";

interface LoginPanelProps {
  className?: string;
  onConnect?: () => void;
}
const LoginPanel: React.FC<LoginPanelProps> = (props) => {
  const { className, onConnect } = props;
  return (
    <div className={cn("flex", "flex-col", "gap-y-6", className)}>
      <h3 className={cn("text-base", "leading-6", "font-medium", "text-black")}>
        <LocalizedText messageID="ConnectWallet.disconnected.description" />
      </h3>
      <AppButton
        size="regular"
        type="primary"
        messageID="ConnectWallet.disconnected.connect"
        onClick={onConnect}
      />
    </div>
  );
};

export { LoginPanel };
