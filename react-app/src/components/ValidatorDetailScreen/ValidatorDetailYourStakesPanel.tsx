import React from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";
import {
  convertBigNumberToFixedPointString,
  convertBigNumberToMillifiedIntegerString,
} from "../../utils/number";
import { YourStake } from "../../models/staking";

interface ValidatorDetailYourStakesProps {
  isLoading: boolean;
  data: YourStake | null;
}

const ValidatorDetailYourStakes: React.FC<ValidatorDetailYourStakesProps> = ({
  isLoading,
  data,
}) => {
  if (isLoading) {
    return (
      <Paper className={cn("flex", "justify-center", "items-center")}>
        <LoadingSpinner />
      </Paper>
    );
  }

  if (data === null) {
    return null;
  }

  const { balance, reward } = data;

  return (
    <Paper>
      <div className="flex items-center">
        <Icon icon={IconType.Safe} className="mr-3 fill-app-black" />
        <h1 className="text-lg font-bold leading-5">
          <LocalizedText messageID="ValidatorDetailScreen.yourStakes.title" />
        </h1>
      </div>
      <div className="flex mt-4">
        <div className="flex flex-col mr-6">
          <p className="mb-2 text-sm font-medium text-app-lightgreen">
            <LocalizedText messageID="ValidatorDetailScreen.yourStakes.staked" />
          </p>
          <p className={cn("text-base", "leading-5", "font-medium")}>
            {convertBigNumberToMillifiedIntegerString(balance.amount)}
          </p>
        </div>
        <div className="flex flex-col mr-6">
          <p className="mb-2 text-sm font-medium text-app-lightgreen">
            <LocalizedText messageID="ValidatorDetailScreen.yourStakes.rewards" />
          </p>
          <p
            className={cn(
              "text-base",
              "leading-5",
              "font-medium",
              "text-app-vote-color-yes"
            )}
          >
            +{convertBigNumberToFixedPointString(reward.amount, 9)}
          </p>
        </div>
      </div>
    </Paper>
  );
};

export default ValidatorDetailYourStakes;
