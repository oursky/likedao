import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import { MessageID } from "../../i18n/LocaleModel";
import StepIndicator, { StepItem } from "../StepIndicator/StepIndicator";

export enum TransactionStep {
  Details = "details",
  Sign = "sign",
}

const DefaultTransactionSteps: StepItem[] = [
  {
    label: "TransactionModal.step1.title",
    value: TransactionStep.Details,
  },
  {
    label: "TransactionModal.step2.title",
    value: TransactionStep.Sign,
  },
];

const ConfirmationPanel: React.FC = () => {
  return (
    <div
      className={cn(
        "flex",
        "items-center",
        "justify-center",
        "p-12",
        "bg-likecoin-lightgrey",
        "rounded-xl"
      )}
    >
      <span className={cn("text-sm", "leading-5", "font-medium", "text-black")}>
        <LocalizedText messageID="TransactionModal.signConfirmation" />
      </span>
    </div>
  );
};

interface BaseTransactionModalProps {
  title: MessageID;
  onClose: () => void;
  currentStep?: TransactionStep;
  children?: React.ReactNode;
  steps?: StepItem[];
}

const BaseTransactionModal: React.FC<BaseTransactionModalProps> = (props) => {
  const {
    title,
    children,
    onClose,
    steps,
    currentStep = TransactionStep.Details,
  } = props;

  return (
    <Transition appear={true} show={true} as={Fragment}>
      <Dialog
        static={true}
        open={true}
        as="div"
        className={cn("relative", "z-10")}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div
          className={cn("fixed", "inset-0", "overflow-y-auto", "select-none")}
        >
          <div
            className={cn(
              "flex",
              "min-h-full",
              "items-center",
              "justify-center",
              "text-center",
              "px-4"
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "w-full",
                  "max-w-2lg",
                  "transform",
                  "overflow-hidden",
                  "rounded-lg",
                  "bg-white",
                  "p-6",
                  "shadow-xl",
                  "transition-all",
                  "flex",
                  "flex-col",
                  "gap-y-6"
                )}
              >
                <Dialog.Title
                  className={cn(
                    "text-lg",
                    "leading-6",
                    "font-medium",
                    "text-gray-900"
                  )}
                >
                  <LocalizedText messageID={title} />
                </Dialog.Title>
                <StepIndicator
                  steps={steps ?? DefaultTransactionSteps}
                  currentStep={currentStep}
                />

                {currentStep === TransactionStep.Details ? (
                  children
                ) : (
                  <ConfirmationPanel />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export { BaseTransactionModal };
