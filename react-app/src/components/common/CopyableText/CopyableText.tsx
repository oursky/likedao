import React, { useCallback } from "react";
import cn from "classnames";
import { useClipboard } from "../../../hooks/useClipboard";
import { Icon, IconType } from "../Icons/Icons";

interface CopyableTextProps {
  containerClassName?: string;
  className?: string;
  text: string;
  onCopied?: () => void;
}

const CopyableText: React.FC<CopyableTextProps> = (props) => {
  const { containerClassName, className, text, onCopied } = props;
  const copy = useClipboard();

  const onCopy = useCallback(async () => {
    try {
      await copy(text);
      onCopied?.();
    } catch (err: unknown) {
      console.error(`Failed to copy text = `, err);
    }
  }, [copy, onCopied, text]);

  return (
    <button
      type="button"
      className={cn(
        "flex",
        "flex-row",
        "items-center",
        "bg-white",
        "rounded-xl",
        "pr-2",
        containerClassName
      )}
      // Error handled by onCopy function
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onCopy}
    >
      <span
        className={cn(
          "w-full",
          "py-1",
          "px-2",
          "rounded-xl",
          "text-ellipsis",
          "overflow-hidden",
          "text-left",
          className
        )}
      >
        {text}
      </span>
      <Icon icon={IconType.Copy} height={16} width={16} />
    </button>
  );
};

export default CopyableText;
