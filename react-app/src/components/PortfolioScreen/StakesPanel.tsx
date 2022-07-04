import React, { useMemo } from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  convertBigNumberToFixedPointString,
  convertBigNumberToMillifiedIntegerString,
} from "../../utils/number";
import Table, {
  ColumnOrder,
  ColumnSortContext,
  SortableColumnHeader,
  TableCell,
  TableHead,
  TableRow,
} from "../common/Table/Table";
import { Stake } from "./PortfolioScreenModel";

interface StakesPanelProps {
  stakes: Stake[];
  isYourPortfolio: boolean;
  order: ColumnOrder;
  setOrder: (order: ColumnOrder) => void;
}

const StakesPanel: React.FC<StakesPanelProps> = ({
  stakes,
  isYourPortfolio,
  order,
  setOrder,
}) => {
  const columnSortContextValue = useMemo(
    () => ({ order, setOrder }),
    [order, setOrder]
  );

  return (
    <Paper>
      <div className={cn("flex", "mb-9")}>
        <Icon
          className={cn("fill-likecoin-black", "mr-3")}
          icon={isYourPortfolio ? IconType.Safe : IconType.CommentsQA}
          height={20}
          width={20}
        />
        <h2
          className={cn(
            "text-lg",
            "font-bold",
            "leading-5",
            "text-likecoin-black"
          )}
        >
          <LocalizedText
            messageID={
              isYourPortfolio
                ? "StakesPanel.yourStakes"
                : "StakesPanel.delegations"
            }
          />
        </h2>
      </div>

      <Table className="inline-block overflow-x-auto w-full min-w-full rounded-lg shadow-md">
        <TableHead>
          <TableRow>
            <ColumnSortContext.Provider value={columnSortContextValue}>
              <SortableColumnHeader
                id="name"
                titleId="StakesPanel.name"
                sortable={true}
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
              <SortableColumnHeader
                id="staked"
                titleId="StakesPanel.staked"
                sortable={true}
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
              <SortableColumnHeader
                id="rewards"
                titleId="StakesPanel.rewards"
                sortable={true}
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
              <SortableColumnHeader
                id="expectedReturns"
                titleId="StakesPanel.expectedReturns"
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
              <SortableColumnHeader
                id="votingPower"
                titleId="StakesPanel.votingPower"
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
            </ColumnSortContext.Provider>
          </TableRow>
        </TableHead>

        <tbody>
          {stakes.map((stake) => (
            <TableRow key={stake.delegation.validatorAddress}>
              <TableCell className="flex items-center py-4">
                {/* TODO: Fetch from Graphql API */}
                <div
                  className={cn(
                    "w-9",
                    "h-9",
                    "leading-none",
                    "rounded-full",
                    "bg-blue-700"
                  )}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-likecoin-green">
                    {stake.validator.moniker}
                  </h3>
                  <p
                    className={cn(
                      "text-xs",
                      "font-medium",
                      "leading-[14px]",
                      "text-likecoin-vote-color-yes"
                    )}
                  >
                    <LocalizedText messageID="StakesPanel.active" />
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {convertBigNumberToMillifiedIntegerString(stake.balance.amount)}
              </TableCell>
              <TableCell>
                {!stake.reward.amount.lt(1)
                  ? convertBigNumberToMillifiedIntegerString(
                      stake.reward.amount
                    )
                  : convertBigNumberToFixedPointString(stake.reward.amount, 9)}
              </TableCell>
              <TableCell>
                {/* TODO: Fetch from Graphql API */}
                15.76%
              </TableCell>
              <TableCell>
                {/* TODO: Fetch from Graphql API */}
                3.69%
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Paper>
  );
};

export default StakesPanel;
