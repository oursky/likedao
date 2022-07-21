import React, { Fragment, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import cn from "classnames";

import { ReactComponent as KeplrLogo } from "../../assets/keplr-logo.svg";
import { ReactComponent as WalletConnectLogo } from "../../assets/walletconnect-logo.svg";

import Divider from "../common/Divider/Divider";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

interface ConnectWalletModalProps {
  isOpened: boolean;
  onClose: () => void;
  onKeplrConnect: () => Promise<void>;
  onWalletConnectConnect: () => Promise<void>;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = (props) => {
  const {
    isOpened,
    onClose,
    onKeplrConnect: onKeplrConnect_,
    onWalletConnectConnect: onWalletConnectConnect_,
  } = props;

  const onKeplrConnect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // Error handled in wallet provider
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onKeplrConnect_();
    },
    [onKeplrConnect_]
  );

  const onWalletConnectConnect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // Error handled in wallet provider
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onWalletConnectConnect_();
    },
    [onWalletConnectConnect_]
  );

  return (
    <Transition appear={true} show={isOpened} as={Fragment}>
      <Dialog as="div" className={"relative z-10"} onClose={onClose}>
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
                  "max-w-sm",
                  "transform",
                  "overflow-hidden",
                  "rounded-lg",
                  "bg-white",
                  "p-6",
                  "shadow-xl",
                  "transition-all",
                  "flex",
                  "flex-col",
                  "gap-y-2"
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
                  <LocalizedText messageID="ConnectWallet.connectModal.title" />
                </Dialog.Title>
                <Dialog.Description
                  className={cn(
                    "text-sm",
                    "leading-5",
                    "font-normal",
                    "text-gray-500"
                  )}
                >
                  <LocalizedText messageID="ConnectWallet.connectModal.description" />
                </Dialog.Description>
                <div className={cn("flex", "flex-col", "mt-3")}>
                  <button
                    className={cn(
                      "flex",
                      "flex-row",
                      "items-center",
                      "text-left",
                      "p-4",
                      "gap-x-2"
                    )}
                    type="button"
                    onClick={onKeplrConnect}
                  >
                    <KeplrLogo height={40} width={40} />
                    <p
                      className={cn(
                        "flex-1",
                        "text-sm",
                        "leading-5",
                        "font-medium",
                        "text-app-green"
                      )}
                    >
                      <LocalizedText messageID="ConnectWallet.connectModal.keplrWallet" />
                    </p>
                    <Icon icon={IconType.ChevronRight} height={20} width={20} />
                  </button>
                  <Divider className={cn("mr-4")} />
                  <button
                    className={cn(
                      "flex",
                      "flex-row",
                      "items-center",
                      "text-left",
                      "p-4",
                      "gap-x-2"
                    )}
                    type="button"
                    onClick={onWalletConnectConnect}
                  >
                    <WalletConnectLogo height={40} width={40} />
                    <p
                      className={cn(
                        "flex-1",
                        "text-sm",
                        "leading-5",
                        "font-medium",
                        "text-app-green"
                      )}
                    >
                      <LocalizedText messageID="ConnectWallet.connectModal.walletConnect" />
                    </p>
                    <Icon icon={IconType.ChevronRight} height={20} width={20} />
                  </button>
                  <Divider className={cn("mr-4")} />
                </div>
                <button
                  type="button"
                  className={cn(
                    "mt-4",
                    "px-3",
                    "py-2",
                    "text-app-green",
                    "text-xs",
                    "leading-4",
                    "font-medium"
                  )}
                  onClick={onClose}
                >
                  <LocalizedText messageID="ConnectWallet.connectModal.noWallet" />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConnectWalletModal;
