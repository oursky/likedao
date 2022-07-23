import React from "react";
import cn from "classnames";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import Paper from "../common/Paper/Paper";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";
import AppButton from "../common/Buttons/AppButton";
import CoinBalanceCard from "../common/CoinBalanceCard/CoinBalanceCard";
import Config from "../../config/Config";
import { convertBigNumberToMillifiedIntegerString } from "../../utils/number";
import { MessageID } from "../../i18n/LocaleModel";
import ValidatorDetailScreenModel from "./ValidatorDetailScreenModel";

interface ValidatorDetailDescriptionPanelProps {
  onStake: () => void;
  onUnstake: () => void;
  isLoading?: boolean;
  data: ValidatorDetailScreenModel | null;
}

interface ValidatorDetailPureComponentProps {
  className?: string;
  data: ValidatorDetailScreenModel;
}

const Title = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center", className)}>
    <Icon icon={IconType.Validator} className="mr-3 fill-app-black" />
    <h1 className="text-lg font-bold leading-5">
      <LocalizedText messageID="ValidatorDetailScreen.descriptionPanel.title" />
    </h1>
  </div>
);

const ProfilePicture = ({ className }: ValidatorDetailPureComponentProps) => (
  <div
    className={cn(
      "flex justify-center items-center bg-app-secondarygreen rounded-xl w-[60px] h-[60px]",
      "sm:rounded-[36px] sm:w-[180px] sm:h-[180px] sm:min-w-[180px]",
      className
    )}
  >
    <Icon
      icon={IconType.Validator}
      className="w-6 h-6 fill-app-green sm:w-[67px] sm:h-[67px]"
    />
  </div>
);

const ValidatorStatus = ({
  data: {
    validator: { status, jailed },
  },
  className,
}: ValidatorDetailPureComponentProps) => {
  const commonClassNames = "text-xs font-medium leading-5";

  if (status === BondStatus.BOND_STATUS_BONDED && !jailed) {
    return (
      <p className={cn("text-app-vote-color-yes", commonClassNames, className)}>
        <LocalizedText messageID="ValidatorDetailScreen.descriptionPanel.status.active" />
      </p>
    );
  }
  return (
    <p className={cn("text-app-vote-color-no", commonClassNames, className)}>
      <LocalizedText messageID="ValidatorDetailScreen.descriptionPanel.status.inactive" />
    </p>
  );
};

const DataField = ({
  children,
  className,
  messageID,
}: {
  children: React.ReactNode;
  className?: string;
  messageID: MessageID;
}) => (
  <div
    className={cn(
      "flex flex-col justify-between mr-6 sm:min-w-[100px]",
      className
    )}
  >
    <p className="mb-2 text-sm font-medium leading-5 text-app-lightgreen">
      <LocalizedText messageID={messageID} />
    </p>
    <p className={cn("text-base", "leading-5", "font-medium")}>{children}</p>
  </div>
);

const Info = ({ className, data }: ValidatorDetailPureComponentProps) => {
  const {
    description,
    tokens,
    votingPower,
    selfDelegation,
    expectedReturn,
    commission: { commissionRates },
  } = data.validator;

  return (
    <div className={cn(className)}>
      {/* Title and descriptions */}
      <h2 className="text-xl font-medium leading-6">{description.moniker}</h2>
      <ValidatorStatus className="mb-3" data={data} />
      <p className="mb-3 text-xs font-medium leading-4">
        {description.details}
      </p>

      {/* contacts and links */}
      {description.securityContact && (
        <p className="mb-3">
          <AppButton
            href={`mailto:${description.securityContact}`}
            type="anchor"
            theme="text"
            size="extra-small"
          >
            {description.securityContact}
          </AppButton>
        </p>
      )}

      {description.website && (
        <p className="mb-6">
          <AppButton
            href={
              description.website.includes("://")
                ? description.website
                : `https://${description.website}`
            }
            type="anchor"
            theme="text"
            size="extra-small"
          >
            {description.website}
          </AppButton>
        </p>
      )}

      {/* balances and stats */}
      <h3 className="text-sm font-medium leading-5 text-app-lightgreen">
        <LocalizedText messageID="ValidatorDetailScreen.descriptionPanel.bondedTokens" />
      </h3>
      <CoinBalanceCard
        balance={tokens.amount}
        denom={Config.chainInfo.currency.coinDenom}
      />

      <div className="flex gap-y-3 justify-between mt-3 sm:justify-start">
        <DataField messageID="ValidatorDetailScreen.descriptionPanel.votingPower">
          {(votingPower * 100).toFixed(2)}%
        </DataField>
        <DataField messageID="ValidatorDetailScreen.descriptionPanel.apy">
          {(expectedReturn * 100).toFixed(2)}%
        </DataField>
        <DataField messageID="ValidatorDetailScreen.descriptionPanel.selfStake">
          {selfDelegation
            ? convertBigNumberToMillifiedIntegerString(selfDelegation.amount)
            : 0}
        </DataField>
        <DataField
          className="hidden sm:flex"
          messageID="ValidatorDetailScreen.descriptionPanel.commissionRate"
        >
          {(commissionRates.rate.toNumber() * 100).toFixed(2)}%
        </DataField>
      </div>
    </div>
  );
};

const ValidatorDetailDescriptionPanel: React.FC<
  ValidatorDetailDescriptionPanelProps
> = (props) => {
  const { isLoading, data, onStake, onUnstake } = props;
  if (isLoading || data === null) {
    return (
      <Paper className={cn("flex", "justify-center", "items-center")}>
        <LoadingSpinner />
      </Paper>
    );
  }

  return (
    <Paper>
      <Title className="mb-4" />
      <div className="flex flex-col py-6 sm:overflow-x-auto sm:flex-row">
        <ProfilePicture className="mb-9 sm:mr-9" data={data} />
        <div className="w-full">
          <Info data={data} />
          <div className="grid grid-cols-2 gap-3 items-center mt-6 w-full sm:grid-cols-3 sm:w-max">
            <AppButton
              className="py-1.5 min-w-fit"
              type="button"
              theme="primary"
              size="regular"
              messageID="ValidatorDetailScreen.descriptionPanel.stake"
              onClick={onStake}
            />
            <AppButton
              className="py-1.5 min-w-fit"
              type="button"
              theme="outlined"
              size="regular"
              messageID="ValidatorDetailScreen.descriptionPanel.unstake"
              onClick={onUnstake}
            />
            {/* TODO: Implement redelegate */}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default ValidatorDetailDescriptionPanel;
