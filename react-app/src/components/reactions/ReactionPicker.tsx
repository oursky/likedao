import React, { useState, useCallback } from "react";
import cn from "classnames";
import { ReactionBarSelector } from "@charkour/react-reactions";
import { usePopper } from "react-popper";
import AppButton from "../common/Buttons/AppButton";
import { useWindowEvent } from "../../hooks/useWindowEvent";
import {
  DefaultReactionMap,
  getReactionType,
  ReactionType,
} from "./ReactionModel";

interface ReactionPickerProps {
  buttonClassName?: string;
  onAddNewReaction?: (type: ReactionType) => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = (props) => {
  const { buttonClassName, onAddNewReaction } = props;

  const [active, setActive] = useState<boolean>(false);

  const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);
  const [pickerRef, setPickerRef] = useState<HTMLElement | null>(null);

  const { styles, attributes, update } = usePopper(buttonRef, pickerRef, {
    placement: "top",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  const togglePicker = useCallback(() => {
    setActive(!active);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    update?.();
  }, [active, update]);

  const onSelect = useCallback(
    (label: string) => {
      const reactionType = getReactionType(label);
      if (reactionType == null) return;
      onAddNewReaction?.(reactionType);
      setActive(false);
    },
    [onAddNewReaction]
  );

  useWindowEvent("mousedown", (event) => {
    const target = event.target as HTMLElement;
    if (!active) return;

    if (buttonRef?.contains(target) || pickerRef?.contains(target)) return;

    setActive(false);
  });

  return (
    <>
      <AppButton
        ref={setButtonRef}
        type="button"
        theme="rounded"
        size="extra-small"
        className={cn(
          "text-app-green",
          "text-sm",
          "leading-5",
          "font-semibold",
          buttonClassName
        )}
        messageID="ReactionPicker.addReaction"
        onClick={togglePicker}
      />
      {active && (
        <div ref={setPickerRef} style={styles.popper} {...attributes.popper}>
          <ReactionBarSelector
            reactions={Object.values(DefaultReactionMap)}
            onSelect={onSelect}
          />
        </div>
      )}
    </>
  );
};
