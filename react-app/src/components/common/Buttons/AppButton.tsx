import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { Link as RouterLink } from "react-router-dom";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

type AppButtonTheme = "primary" | "secondary" | "rounded" | "text" | "outlined";
type AppButtonSize = "regular" | "small" | "extra-small";

interface AppButtonCommonProps {
  theme: AppButtonTheme;
  size: AppButtonSize;
  messageID?: MessageID;
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

function getButtonFontStyle(size: AppButtonSize): string {
  switch (size) {
    case "regular":
      return cn("text-base", "leading-6", "font-medium");
    case "small":
      return cn("text-sm", "leading-4", "font-medium");
    case "extra-small":
      return cn("text-sm", "leading-4", "font-medium");
    default:
      throw new Error("Unknown button size");
  }
}

function getButtonPaddings(size: AppButtonSize): string {
  switch (size) {
    case "regular":
      return cn("py-3", "px-6");
    case "small":
      return cn("py-3", "px-4");
    case "extra-small":
      return cn("py-2", "px-3");
    default:
      throw new Error("Unknown button size");
  }
}

// eslint-disable-next-line complexity
function getButtonClassNames(
  theme: AppButtonTheme,
  size: AppButtonSize
): string {
  switch (theme) {
    case "primary":
      return cn(
        "bg-likecoin-green",
        "text-white",
        "disabled:bg-gray-300",
        "hover:bg-likecoin-lightgreen",
        "acitve:bg-likecoin-darkgreen",
        "transition-colors",
        "rounded-md",
        "shadow-sm",
        getButtonPaddings(size),
        getButtonFontStyle(size)
      );
    case "secondary":
      return cn(
        "bg-white",
        "text-likecoin-green",
        "disabled:bg-gray-300",
        "hover:bg-likecoin-lightgreen",
        "hover:text-white",
        "acitve:bg-likecoin-darkgreen",
        "transition-colors",
        "rounded-md",
        "shadow-sm",
        getButtonPaddings(size),
        getButtonFontStyle(size)
      );
    case "rounded":
      return cn(
        "rounded-full",
        "bg-likecoin-secondarygreen",
        "hover:bg-likecoin-lightgreen",
        "hover:text-white",
        "transition-colors",
        "rounded-md",
        "shadow-sm",
        getButtonPaddings(size),
        getButtonFontStyle(size)
      );
    case "text":
      return cn(
        "text-likecoin-green",
        "after:bg-likecoin-green",
        "relative",
        "after:transition-[width]",
        "after:duration-300",
        "hover:after:w-full",
        "after:w-0",
        "after:h-0.5",
        "after:absolute",
        "after:left-0",
        "after:-bottom-0.5",
        getButtonFontStyle(size)
      );
    case "outlined":
      return cn(
        "bg-white",
        "text-likecoin-green",
        "border",
        "hover:bg-likecoin-lightgreen",
        "border-likecoin-green",
        "disabled:bg-gray-300",
        "hover:text-white",
        "transition-colors",
        "rounded-md",
        "shadow-sm",
        getButtonPaddings(size),
        getButtonFontStyle(size)
      );
    default:
      throw new Error("Unknown button type");
  }
}

const Button = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "type">>(
  (props, ref) => {
    const { messageID, onClick: onClick_, children, ...rest } = props;

    const onClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onClick_?.();
      },
      [onClick_]
    );

    return (
      <button ref={ref} type="button" onClick={onClick} {...rest}>
        {messageID ? <LocalizedText messageID={messageID} /> : children}
      </button>
    );
  }
);

const Link = React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "type">>(
  (props, ref) => {
    const { messageID, children, ...rest } = props;

    return (
      <RouterLink ref={ref} {...rest}>
        {messageID ? <LocalizedText messageID={messageID} /> : children}
      </RouterLink>
    );
  }
);

/**
 * Anchor link to external websites
 *
 * Open in new tab by default
 */
const AnchorLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<AnchorProps, "type">
>((props, ref) => {
  const { messageID, children, ...rest } = props;

  return (
    <a ref={ref} target="_blank" {...rest}>
      {messageID ? <LocalizedText messageID={messageID} /> : children}
    </a>
  );
});

const AppButton = React.forwardRef<HTMLElement, AppButtonProps>(
  (props, ref) => {
    const { type = "button", theme, size, className, ...rest } = props;

    const computedClassName = useMemo(
      () => cn(getButtonClassNames(theme, size), className),
      [className, theme, size]
    );

    switch (type) {
      case "button":
        return (
          <Button
            ref={ref as any}
            {...(rest as ButtonProps)}
            className={computedClassName}
          />
        );
      case "link":
        return (
          <Link
            ref={ref as any}
            {...(rest as LinkProps)}
            className={computedClassName}
          />
        );
      case "anchor":
        return (
          <AnchorLink
            ref={ref as any}
            {...(rest as AnchorProps)}
            className={computedClassName}
          />
        );
      default:
        throw new Error("Unknown button type");
    }
  }
);

export default AppButton;
