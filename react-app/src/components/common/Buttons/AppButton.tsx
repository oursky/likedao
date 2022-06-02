import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { Link as RouterLink } from "react-router-dom";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

type AppButtonTheme = "primary" | "secondary";
type AppButtonSize = "regular" | "small";

interface AppButtonCommonProps {
  theme: AppButtonTheme;
  size: AppButtonSize;
  messageID: MessageID;
}

interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "type">,
    Pick<AppButtonCommonProps, "messageID"> {
  type?: "link";
  to: string;
}

interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "type" | "onClick"
    >,
    Pick<AppButtonCommonProps, "messageID"> {
  type?: "button";
  onClick?: () => void;
}

type AppButtonProps = (LinkProps | ButtonProps) & AppButtonCommonProps;

function getButtonThemeClassNames(theme: AppButtonTheme): string {
  switch (theme) {
    case "primary":
      return cn(
        "bg-likecoin-green",
        "text-white",
        "hover:bg-likecoin-lightgreen"
      );
    case "secondary":
      return cn(
        "bg-white",
        "text-likecoin-green",
        "hover:bg-likecoin-lightgreen",
        "hover:text-white"
      );
    default:
      throw new Error("Unknown button type");
  }
}

function getButtonSizeStyle(size: AppButtonSize): string {
  switch (size) {
    case "regular":
      return cn(
        "text-base",
        "leading-6",
        "font-medium",
        "py-3",
        "px-6",
        "rounded-md",
        "shadow-sm",
        "rounded-md"
      );
    case "small":
      return cn(
        "text-sm",
        "leading-4",
        "font-medium",
        "py-2",
        "px-3",
        "rounded-md",
        "shadow-sm",
        "rounded-md"
      );
    default:
      throw new Error("Unknown button size");
  }
}

const Button: React.FC<Omit<ButtonProps, "type">> = (props) => {
  const { messageID, onClick: onClick_, ...rest } = props;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );

  return (
    <button type="button" onClick={onClick} {...rest}>
      <LocalizedText messageID={messageID} />
    </button>
  );
};

const Link: React.FC<Omit<LinkProps, "type">> = (props) => {
  const { messageID, ...rest } = props;

  return (
    <RouterLink {...rest}>
      <LocalizedText messageID={messageID} />
    </RouterLink>
  );
};

const AppButton: React.FC<AppButtonProps> = (props) => {
  const { type = "button", theme, size, className, ...rest } = props;

  const computedClassName = useMemo(
    () =>
      cn(getButtonThemeClassNames(theme), getButtonSizeStyle(size), className),
    [className, theme, size]
  );

  switch (type) {
    case "button":
      return (
        <Button {...(rest as ButtonProps)} className={computedClassName} />
      );
    case "link":
      return <Link {...(rest as LinkProps)} className={computedClassName} />;
    default:
      throw new Error("Unknown button type");
  }
};

export default AppButton;
