import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

export interface StepItem {
  label: MessageID;
  value: string;
}

interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = (props) => {
  const { steps, currentStep } = props;

  return (
    <ol
      role="list"
      className={cn("space-y-4", "flex", "space-y-0", "space-x-8")}
    >
      {steps.map((step, index) => (
        <li key={step.value} className="flex-1">
          <div
            className={cn(
              "pl-4",
              "py-2",
              "flex",
              "flex-col",
              "border-l-4",
              "pl-0",
              "pt-4",
              "pb-0",
              "border-l-0",
              "border-t-4",
              "items-start",
              currentStep === step.value
                ? "border-app-green"
                : "border-gray-200"
            )}
          >
            <span
              className={cn(
                "text-xs",
                "font-semibold",
                "leading-4",
                "uppercase",
                currentStep === step.value
                  ? "text-app-green"
                  : "text-app-darkgrey"
              )}
            >
              <LocalizedText
                messageID="StepIndicator.step"
                messageArgs={{
                  step: index + 1,
                }}
              />
            </span>
            <span
              className={cn(
                "text-sm",
                "font-medium",
                "leading-5",
                "text-app-black"
              )}
            >
              <LocalizedText messageID={step.label} />
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StepIndicator;
