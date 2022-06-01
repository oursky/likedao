import React, { Fragment, useCallback } from "react";
import cn from "classnames";
import { Transition, Dialog } from "@headlessui/react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import CopyableText from "../common/CopyableText/CopyableText";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { useLocale } from "../../providers/AppLocaleProvider";

interface UserAddressModalProps {
  isOpened: boolean;
  address: string;
  onClose: () => void;
}

const UserAddressModal: React.FC<UserAddressModalProps> = (props) => {
  const { address, isOpened, onClose } = props;
  const { translate } = useLocale();

  const onAddressCopied = useCallback(() => {
    toast.success(translate("UserAddressModal.addressCopied"));
  }, [translate]);

  return (
    <Transition appear={true} show={isOpened} as={Fragment}>
      <Dialog as="div" className={cn("relative", "z-10")} onClose={onClose}>
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
                  "gap-y-6",
                  "items-center"
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
                  <LocalizedText messageID="UserAddressModal.title" />
                </Dialog.Title>
                <QRCode className={cn("flex-1")} value={address} size={320} />
                <div
                  className={cn(
                    "w-full",
                    "flex",
                    "flex-col",
                    "gap-y-1",
                    "items-start"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      "leading-5",
                      "font-medium",
                      "text-likecoin-black"
                    )}
                  >
                    <LocalizedText messageID="UserAddressModal.myAddress" />
                  </span>
                  <CopyableText
                    containerClassName={cn(
                      "w-full",
                      "border",
                      "border-likecoin-grey",
                      "drop-shadow-sm"
                    )}
                    className={cn(
                      "text-2xs",
                      "leading-6",
                      "font-medium",
                      "text-likecoin-green"
                    )}
                    text={address}
                    onCopied={onAddressCopied}
                  />
                </div>
                <AppButton
                  className={cn("self-end")}
                  size="regular"
                  theme="primary"
                  onClick={onClose}
                  messageID="UserAddressModal.done"
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UserAddressModal;
