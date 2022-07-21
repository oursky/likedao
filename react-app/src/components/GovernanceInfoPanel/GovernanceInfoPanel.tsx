import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import { useGovAPI } from "../../api/govAPI";
import { useLocale } from "../../providers/AppLocaleProvider";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";
import {
  convertBigNumberToFixedPointString,
  formatDecimalToPercentage,
} from "../../utils/number";
import { MessageID } from "../../i18n/LocaleModel";
import { GovParams } from "../../models/cosmos/gov";
import { convertDurationToDays } from "../../utils/datetime";

const InfoField: React.FC<{
  labelMessageID: MessageID;
  value: React.ReactNode;
}> = ({ labelMessageID, value }) => (
  <div className="flex flex-col justify-between">
    <h3 className={cn("text-app-lightgreen", "text-sm", "font-medium", "mb-2")}>
      <LocalizedText messageID={labelMessageID} />
    </h3>
    <div className={cn("text-base", "leading-5", "font-medium")}>{value}</div>
  </div>
);

const GovernanceInfoPanel: React.FC = () => {
  const govAPI = useGovAPI();
  const { translate } = useLocale();

  const [govParams, setGovParams] = useState<GovParams | null>(null);

  const fetchGovParams = useCallback(async () => {
    try {
      const params = await govAPI.getAllParams();
      setGovParams(params);
    } catch {
      toast.error(translate("GovernanceInfoPanel.error"));
    }
  }, [govAPI, translate]);

  useEffect(() => {
    // Error handled inside `fetchGovParams()`
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchGovParams();
  }, [fetchGovParams]);

  if (!govParams) {
    return (
      <Paper>
        <LoadingSpinner />
      </Paper>
    );
  }

  const {
    deposit: { minDeposit, maxDepositPeriod },
    tally: { quorum, threshold, vetoThreshold },
    voting: { votingPeriod },
  } = govParams;

  return (
    <Paper>
      <div className={cn("flex", "items-center", "mb-5", "gap-2.5")}>
        <Icon icon={IconType.Info} className={cn("w-6", "h-6")} />
        <h2 className={cn("text-lg", "leading-none", "font-bold")}>
          <LocalizedText messageID="GovernanceInfoPanel.governanceInfo" />
        </h2>
      </div>
      <div
        className={cn("flex", "flex-col", "sm:flex-row", "gap-3", "sm:gap-16")}
      >
        <InfoField
          labelMessageID="GovernanceInfoPanel.minDeposit"
          value={`${convertBigNumberToFixedPointString(
            minDeposit.amount
          )} ${minDeposit.denom.toUpperCase()}`}
        />
        <InfoField
          labelMessageID="GovernanceInfoPanel.maxDepositPeriod"
          value={translate("GovernanceInfoPanel.period", {
            days: convertDurationToDays(maxDepositPeriod),
          })}
        />
        <InfoField
          labelMessageID="GovernanceInfoPanel.quorum"
          value={`${formatDecimalToPercentage(quorum)}%`}
        />
        <InfoField
          labelMessageID="GovernanceInfoPanel.threshold"
          value={`${formatDecimalToPercentage(threshold)}%`}
        />
        <InfoField
          labelMessageID="GovernanceInfoPanel.vetoThreshold"
          value={`${formatDecimalToPercentage(vetoThreshold)}%`}
        />
        <InfoField
          labelMessageID="GovernanceInfoPanel.votingPeriod"
          value={translate("GovernanceInfoPanel.period", {
            days: convertDurationToDays(votingPeriod),
          })}
        />
      </div>
    </Paper>
  );
};

export default GovernanceInfoPanel;
