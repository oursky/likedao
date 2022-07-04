import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import * as SectionedTable from "../SectionedTable/SectionedTable";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import PageContoller from "../common/PageController/PageController";
import { useLocale } from "../../providers/AppLocaleProvider";
import { BigNumberCoin } from "../../models/coin";
import ColorBar from "../common/ColorBar/ColorBar";
import Config from "../../config/Config";
import { useGovAPI } from "../../api/govAPI";
import {
  Proposal,
  ProposalDeposit,
  ProposalDepositDepositor,
} from "./ProposalDetailScreenModel";
import {
  ProposalDepositSortableColumn,
  useProposalDepositsQuery,
} from "./ProposalDetailScreenAPI";

const PROPOSAL_DEPOSIT_PAGE_SIZE = 5;
const CoinDenom = Config.chainInfo.currency.coinDenom;

const ProposalDepositor: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  depositor?: ProposalDepositDepositor | null;
}> = ({ depositor }) => {
  if (!depositor) {
    return null;
  }
  if (depositor.__typename === "StringObject") {
    return (
      <span
        className={cn(
          "text-sm",
          "leading-5",
          "font-normal",
          "text-likecoin-green"
        )}
      >
        {depositor.value}
      </span>
    );
  }

  if (depositor.__typename === "Validator") {
    return (
      <div className={cn("flex", "flex-col", "gap-y-0.5")}>
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-green"
          )}
        >
          {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
          {depositor.moniker || depositor.operatorAddress}
        </span>
        <span
          className={cn(
            "text-xs",
            "leading-tight",
            "font-medium",
            "text-likecoin-yellow"
          )}
        >
          <LocalizedText messageID="ProposalDetail.deposits.depositor.validator" />
        </span>
      </div>
    );
  }

  // Should not be reachable
  return null;
};

const ProposalDepositAmount: React.FC<{ deposit: BigNumberCoin }> = ({
  deposit,
}) => {
  return (
    <span className={cn("text-sm", "leading-5", "font-normal", "text-black")}>
      {deposit.amount.toFixed(4)}{" "}
      <span className={cn("uppercase")}>{deposit.denom}</span>
    </span>
  );
};

const ProposalDepositInfo: React.FC<{
  totalDepositAmount: BigNumber;
  requiredDepositAmount: BigNumber;
}> = ({ totalDepositAmount, requiredDepositAmount }) => {
  const colorBarData = {
    value: BigNumber.min(totalDepositAmount, requiredDepositAmount),
    colorClassName: "bg-likecoin-vote-color-yes",
  };

  return (
    <div className={cn("flex", "flex-col", "gap-y-4")}>
      <div className={cn("h-11")}>
        <ColorBar
          data={[colorBarData]}
          showPercentage={true}
          total={requiredDepositAmount}
          className={cn("rounded-full")}
        />
      </div>
      <div className={cn("flex", "flex-row", "gap-x-4")}>
        <span className={cn("text-xs", "leading-5", "font-bold", "text-black")}>
          <LocalizedText messageID="ProposalDetail.deposits.total" />
          <span
            className={cn("text-xs", "leading-5", "font-medium", "text-black")}
          >
            {` ${totalDepositAmount.toFixed(4)} ${CoinDenom}`}
          </span>
        </span>
        <span className={cn("text-xs", "leading-5", "font-bold", "text-black")}>
          <LocalizedText messageID="ProposalDetail.deposits.minimumDeposit" />
          <span
            className={cn("text-xs", "leading-5", "font-medium", "text-black")}
          >
            {` ${totalDepositAmount.toFixed(4)} ${CoinDenom}`}
          </span>
        </span>
      </div>
    </div>
  );
};

const ProposalDepositsPanel: React.FC = () => {
  const proposal = useOutletContext<Proposal>();
  const { translate } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const govAPI = useGovAPI();
  const [minimumDeposit, setMinimumDeposit] = useState<BigNumber>(
    new BigNumber(0)
  );

  const [currentOffset, sortOrder] = useMemo(() => {
    const page = searchParams.get("page") ?? "1";
    const sortBy = searchParams.get("sortBy");
    const sortDirection = searchParams.get("sortDirection");

    const sortOrder =
      sortBy && sortDirection
        ? {
            id: sortBy as ProposalDepositSortableColumn,
            direction: sortDirection as SectionedTable.ColumnOrder["direction"],
          }
        : undefined;

    const offset = (parseInt(page, 10) - 1) * PROPOSAL_DEPOSIT_PAGE_SIZE;

    return [offset, sortOrder];
  }, [searchParams]);

  const { fetch, requestState } = useProposalDepositsQuery(
    proposal.id,
    0,
    PROPOSAL_DEPOSIT_PAGE_SIZE
  );

  const setPage = useCallback(
    (after: number) => {
      setSearchParams({
        page: `${Math.floor(after / PROPOSAL_DEPOSIT_PAGE_SIZE) + 1}`,
      });
    },
    [setSearchParams]
  );

  const setSortOrder = useCallback(
    (order: SectionedTable.ColumnOrder) => {
      setSearchParams({
        sortBy: order.id,
        sortDirection: order.direction,
      });
    },
    [setSearchParams]
  );

  const tableSections =
    useMemo((): SectionedTable.SectionItem<ProposalDeposit>[] => {
      if (!isRequestStateLoaded(requestState)) {
        return [];
      }
      return [
        {
          titleId: "ProposalDetail.deposits.delegatedValidators",
          className: cn(
            "uppercase",
            "bg-likecoin-secondarygreen",
            "text-likecoin-green"
          ),
          items: requestState.data.pinnedDeposits,
        },
        {
          titleId: "ProposalDetail.deposits.others",
          className: cn(
            "uppercase",
            "bg-likecoin-gold",
            "text-likecoin-darkgrey"
          ),
          items: requestState.data.deposits,
        },
      ];
    }, [requestState]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch({
      first: PROPOSAL_DEPOSIT_PAGE_SIZE,
      after: currentOffset,
      order: sortOrder
        ? {
            id: sortOrder.id,
            direction: sortOrder.direction,
          }
        : null,
    });
  }, [fetch, currentOffset, sortOrder]);

  useEffect(() => {
    govAPI
      .getMinDepositParams()
      .then((value) => {
        setMinimumDeposit(value.amount);
      })
      .catch((err) => {
        console.error("Failed to fetch minimum deposit = ", err);
        toast.error(translate("ProposalDetail.deposits.minimumDeposit.error"));
      });
  }, [govAPI, translate]);

  useEffect(() => {
    if (isRequestStateError(requestState)) {
      toast.error(translate("ProposalDetail.deposits.requestState.error"));
    }
  }, [requestState, translate]);

  return (
    <div className={cn("flex", "flex-col", "gap-y-4")}>
      <ProposalDepositInfo
        totalDepositAmount={proposal.depositTotal}
        requiredDepositAmount={minimumDeposit}
      />
      <SectionedTable.Table
        sections={tableSections}
        isLoading={!isRequestStateLoaded(requestState)}
        emptyMessageID="ProposalDetail.deposits.empty"
        sortOrder={sortOrder}
        onSort={setSortOrder}
      >
        <SectionedTable.Column<ProposalDeposit>
          id={ProposalDepositSortableColumn.Depositor}
          titleId="ProposalDetail.deposits.depositor"
          sortable={true}
        >
          {(item) => <ProposalDepositor depositor={item.depositor} />}
        </SectionedTable.Column>
        <SectionedTable.Column<ProposalDeposit>
          id={ProposalDepositSortableColumn.Amount}
          titleId="ProposalDetail.deposits.amount"
          sortable={true}
        >
          {(item) => <ProposalDepositAmount deposit={item.amount} />}
        </SectionedTable.Column>
      </SectionedTable.Table>
      <PageContoller
        offsetBased={true}
        pageSize={PROPOSAL_DEPOSIT_PAGE_SIZE}
        totalItems={
          isRequestStateLoaded(requestState) ? requestState.data.totalCount : 0
        }
        currentOffset={currentOffset}
        onPageChange={setPage}
      />
    </div>
  );
};

export { ProposalDepositsPanel };
