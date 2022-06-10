import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { Link as RouterLink } from "react-router-dom";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

type AppButtonTheme = "primary" | "secondary" | "rounded";
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

interface AnchorProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type">,
    Pick<AppButtonCommonProps, "messageID"> {
  type?: "anchor";
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

type AppButtonProps = (LinkProps | ButtonProps | AnchorProps) &
  AppButtonCommonProps;

function getButtonThemeClassNames(theme: AppButtonTheme): string {
  switch (theme) {
    case "primary":
      return cn(
        "bg-likecoin-green",
        "text-white",
        "disabled:bg-gray-300",
        "hover:bg-likecoin-lightgreen",
        "acitve:bg-likecoin-darkgreen"
      );
    case "secondary":
      return cn(
        "bg-white",
        "text-likecoin-green",
        "disabled:bg-gray-300",
        "hover:bg-likecoin-lightgreen",
        "hover:text-white",
        "acitve:bg-likecoin-darkgreen"
      );
    case "rounded":
      return cn(
        "rounded-full",
        "bg-likecoin-secondarygreen",
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
        "py-3",
        "px-4",
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

/**
 * Anchor link to external websites
 *
 * Open in new tab by default
 */
const AnchorLink: React.FC<Omit<AnchorProps, "type">> = (props) => {
  const { messageID, ...rest } = props;

  return (
    <a target="_blank" {...rest}>
      <LocalizedText messageID={messageID} />
    </a>
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
    case "anchor":
      return (
        <AnchorLink {...(rest as AnchorProps)} className={computedClassName} />
      );
    default:
      throw new Error("Unknown button type");
  }
};

export default AppButton;
