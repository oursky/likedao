import React, { useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import ColorBar, { ColorBarData } from "../common/ColorBar/ColorBar";
import { Proposal } from "../ProposalDetailScreen/ProposalDetailScreenModel";
import Config from "../../config/Config";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

interface VoteDetailProps {
  labelId: MessageID;
  value: BigNumber;
  total: BigNumber;
  colorClassName: string;
}

const VoteDetail: React.FC<VoteDetailProps> = (props) => {
  const { labelId, value, total, colorClassName } = props;
  const coinDenom = Config.chainInfo.currency.coinDenom;

  const percentage = useMemo(() => {
    if (value.isZero() || total.isZero()) {
      return new BigNumber(0);
    }
    return value.dividedBy(total).shiftedBy(2);
  }, [value, total]);

  return (
    <div className={cn("flex", "flex-row", "gap-x-2.5")}>
      <div className={cn("w-1", "h-8", "rounded-2xl", colorClassName)} />
      <div className={cn("flex", "flex-col", "gap-y-1")}>
        <span
          className={cn("text-base", "leading-5", "font-bold", "text-black")}
        >
          <LocalizedText messageID={labelId} />
        </span>
        <span
          className={cn("text-xs", "leading-5", "font-normal", "text-black")}
        >
          {`${percentage.toFixed(2)}%`}
        </span>
        <span
          className={cn("text-xs", "leading-5", "font-normal", "text-black")}
        >
          {`${value.toFixed(4)} ${coinDenom}`}
        </span>
      </div>
    </div>
  );
};

interface TallyResultIndicatorProps {
  proposal: Proposal;
}

const TallyResultIndicator: React.FC<TallyResultIndicatorProps> = (props) => {
  const { proposal } = props;
  const coinDenom = Config.chainInfo.currency.coinDenom;

  const [voteData, total] = useMemo((): [
    {
      yes: ColorBarData;
      no: ColorBarData;
      noWithVeto: ColorBarData;
      abstain: ColorBarData;
    },
    BigNumber
  ] => {
    const yesAmount = new BigNumber(proposal.tallyResult?.yes ?? 0);
    const noAmount = new BigNumber(proposal.tallyResult?.no ?? 0);
    const vetoAmount = new BigNumber(proposal.tallyResult?.noWithVeto ?? 0);
    const abstainAmount = new BigNumber(proposal.tallyResult?.abstain ?? 0);

    const total = BigNumber.sum(yesAmount, noAmount, vetoAmount, abstainAmount);

    const voteData = {
      yes: {
        value: yesAmount,
        colorClassName: "bg-likecoin-vote-color-yes",
      },
      no: {
        value: noAmount,
        colorClassName: "bg-likecoin-vote-color-no",
      },
      noWithVeto: {
        value: vetoAmount,
        colorClassName: "bg-likecoin-vote-color-veto",
      },
      abstain: {
        value: abstainAmount,
        colorClassName: "bg-likecoin-vote-color-abstain",
      },
    };

    return [voteData, total];
  }, [proposal]);

  return (
    <div className={cn("flex", "flex-col", "gap-y-4")}>
      <div className={cn("h-11")}>
        <ColorBar
          data={Object.values(voteData)}
          showPercentage={true}
          className={cn("rounded-full")}
        />
      </div>
      <div
        className={cn(
          "flex",
          "flex-col",
          "gap-y-1",
          "sm:gap-y-0",
          "sm:flex-row",
          "sm:gap-x-4"
        )}
      >
        <span className={cn("text-xs", "leading-5", "font-bold", "text-black")}>
          <LocalizedText messageID="ProposalDetail.total" />
          <span
            className={cn("text-xs", "leading-5", "font-medium", "text-black")}
          >
            {` ${total.toFixed(4)} ${coinDenom}`}
          </span>
        </span>
        <div className={cn("flex", "flex-row", "gap-x-4")}>
          <span
            className={cn("text-xs", "leading-5", "font-bold", "text-black")}
          >
            <LocalizedText messageID="ProposalDetail.turnOut" />
            <span
              className={cn(
                "text-xs",
                "leading-5",
                "font-medium",
                "text-black"
              )}
            >
              {` ${proposal.turnout.toFixed(1)}%`}
            </span>
          </span>
          <span
            className={cn("text-xs", "leading-5", "font-bold", "text-black")}
          >
            <LocalizedText messageID="ProposalDetail.quorum" />
            <span
              className={cn(
                "text-xs",
                "leading-5",
                "font-medium",
                "text-black"
              )}
            >
              {/* TODO: Handle this param */}
              {` 40%`}
            </span>
          </span>
        </div>
      </div>
      <div
        className={cn(
          "grid",
          "grid-rows-2",
          "grid-cols-2",
          "gap-y-2.5",
          "sm:gap-y-0",
          "sm:grid-cols-4",
          "sm:grid-rows-1"
        )}
      >
        <VoteDetail
          labelId="proposal.voteOption.yes"
          value={voteData.yes.value}
          colorClassName={voteData.yes.colorClassName}
          total={total}
        />
        <VoteDetail
          labelId="proposal.voteOption.no"
          value={voteData.no.value}
          colorClassName={voteData.no.colorClassName}
          total={total}
        />
        <VoteDetail
          labelId="proposal.voteOption.noWithVeto"
          value={voteData.noWithVeto.value}
          colorClassName={voteData.noWithVeto.colorClassName}
          total={total}
        />
        <VoteDetail
          labelId="proposal.voteOption.abstain"
          value={voteData.abstain.value}
          colorClassName={voteData.abstain.colorClassName}
          total={total}
        />
      </div>
    </div>
  );
};

export default TallyResultIndicator;
