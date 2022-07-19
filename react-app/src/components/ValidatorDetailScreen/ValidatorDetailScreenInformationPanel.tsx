import React from "react";
import { MessageID } from "../../i18n/LocaleModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import Paper from "../common/Paper/Paper";
import LocalizedText from "../common/Localized/LocalizedText";
import UTCDatetime from "../common/DateTime/UTCDatetime";
import { Icon, IconType } from "../common/Icons/Icons";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import { translateAddress } from "../../utils/address";
import Config from "../../config/Config";
import ValidatorDetailScreenModel from "./ValidatorDetailScreenModel";

interface ValidatorDetailScreenInformationPanelProps {
  isLoading: boolean;
  data?: ValidatorDetailScreenModel;
}

const InformationField = ({
  messageID,
  children,
}: {
  messageID: MessageID;
  children: React.ReactNode;
}) => {
  return (
    <div className="text-sm font-medium">
      <h3 className="mb-1 text-app-lightgreen">
        <LocalizedText messageID={messageID} />
      </h3>
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {children}
      </div>
    </div>
  );
};

const ValidatorDetailScreenInformationPanel: React.FC<
  ValidatorDetailScreenInformationPanelProps
> = ({ isLoading, data }) => {
  const { translate } = useLocale();

  if (isLoading || !data) {
    return (
      <Paper className="flex justify-center items-center">
        <LoadingSpinner />
      </Paper>
    );
  }

  const {
    uptime,
    signingInfo: { startHeight },
    validator: {
      commission: { commissionRates, updateTime: commissionUpdateTime },
      operatorAddress,
    },
  } = data;

  return (
    <Paper>
      <div className="flex items-center mb-5">
        <Icon icon={IconType.Info} className="mr-3 fill-app-black" />
        <h1 className="text-lg font-bold leading-5">
          <LocalizedText messageID="ValidatorDetailScreen.information" />
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InformationField messageID="ValidatorDetailScreen.information.address">
          <AppButton
            theme="text"
            size="extra-small"
            type="link"
            to={AppRoutes.OtherPortfolio.replace(
              ":address",
              translateAddress(
                operatorAddress,
                Config.chainInfo.bech32Config.bech32PrefixAccAddr
              )
            )}
          >
            {operatorAddress}
          </AppButton>
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.uptime">
          {`${(uptime * 100).toFixed(2)}%`}
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.since">
          {translate("ValidatorDetailScreen.information.since.value", {
            height: startHeight.toNumber(),
          })}
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.commissionRate">
          <p>{`${commissionRates.rate.times(100).toString(10)}%`}</p>
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.maxCommissionRate">
          <p>{`${commissionRates.rate.times(100).toString(10)}%`}</p>
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.maxCommissionChangeRate">
          <p>{`${commissionRates.rate.times(100).toString(10)}%`}</p>
        </InformationField>
        <InformationField messageID="ValidatorDetailScreen.information.commissionUpdateTime">
          {commissionUpdateTime ? (
            <UTCDatetime date={commissionUpdateTime} />
          ) : (
            "-"
          )}
        </InformationField>
      </div>
    </Paper>
  );
};

export default ValidatorDetailScreenInformationPanel;
