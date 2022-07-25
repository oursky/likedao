import React, { useMemo } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
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
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import AppRoutes from "../../navigation/AppRoutes";
import { Stake } from "../PortfolioScreen/PortfolioScreenModel";

interface StakesTablePanelProps {
  isLoading: boolean;
  stakes: Stake[] | null;
  isYourPortfolio: boolean;
  order: ColumnOrder;
  setOrder: (order: ColumnOrder) => void;
}

const StakesTablePanel: React.FC<StakesTablePanelProps> = ({
  isLoading,
  stakes,
  isYourPortfolio,
  order,
  setOrder,
}) => {
  const columnSortContextValue = useMemo(
    () => ({ order, setOrder }),
    [order, setOrder]
  );

  if (isLoading) {
    return (
      <Paper className={cn("flex", "justify-center", "items-center")}>
        <LoadingSpinner />
      </Paper>
    );
  }

  if (!stakes || stakes.length === 0) {
    return null;
  }

  return (
    <Paper>
      <div className={cn("flex", "mb-9")}>
        <Icon
          className={cn("fill-app-black", "mr-3")}
          icon={isYourPortfolio ? IconType.Safe : IconType.CommentsQA}
          height={20}
          width={20}
        />
        <h2
          className={cn("text-lg", "font-bold", "leading-5", "text-app-black")}
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

      <Table>
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
                sortable={true}
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
              <SortableColumnHeader
                id="votingPower"
                titleId="StakesPanel.votingPower"
                sortable={true}
                className="uppercase bg-gray-50 border-b border-gray-200"
              />
            </ColumnSortContext.Provider>
          </TableRow>
        </TableHead>

        <tbody>
          {stakes.map((stake) => (
            <TableRow key={stake.delegation.validatorAddress}>
              <TableCell className="flex items-center py-4">
                <div
                  className={cn(
                    "w-9",
                    "h-9",
                    "leading-none",
                    "rounded-full",
                    "bg-blue-700",
                    "flex-shrink-0"
                  )}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-app-green">
                    <Link
                      to={AppRoutes.ValidatorDetail.replace(
                        ":address",
                        stake.validator.operatorAddress
                      )}
                    >
                      {stake.validator.description.moniker}
                    </Link>
                  </h3>
                  <p
                    className={cn(
                      "text-xs",
                      "font-medium",
                      "leading-[14px]",
                      "text-app-vote-color-yes"
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
              <TableCell>{(stake.expectedReturn * 100).toFixed(2)}%</TableCell>
              <TableCell>
                {(stake.validator.votePower * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Paper>
  );
};

export default StakesTablePanel;
