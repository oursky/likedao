import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { useWindowEvent } from "../../../hooks/useWindowEvent";
import Tooltip from "../Tooltip/Tooltip";

export interface ColorBarData {
  value: BigNumber;
  colorClassName: string;
}

interface ColorBarSectionProps {
  data: ColorBarData;
  total: BigNumber;
  showPercentage?: boolean;
}

export const makeColorBarData = (
  data?: {
    yes?: BigNumber.Value;
    no?: BigNumber.Value;
    abstain?: BigNumber.Value;
    noWithVeto?: BigNumber.Value;
  } | null
): ColorBarData[] => [
  {
    value: new BigNumber(data?.yes ?? 0),
    colorClassName: "bg-app-vote-color-yes",
  },
  {
    value: new BigNumber(data?.no ?? 0),
    colorClassName: "bg-app-vote-color-no",
  },
  {
    value: new BigNumber(data?.noWithVeto ?? 0),
    colorClassName: "bg-app-vote-color-veto",
  },
  {
    value: new BigNumber(data?.abstain ?? 0),
    colorClassName: "bg-app-vote-color-abstain",
  },
];

const ColorBarSection: React.FC<ColorBarSectionProps> = (props) => {
  const { data, total, showPercentage } = props;
  const [percentageEl, setPercentageEl] = useState<HTMLSpanElement | null>(
    null
  );

  const [refEle, setRefEle] = useState<HTMLDivElement | null>(null);

  const percentage = useMemo(() => {
    if (total.isZero()) {
      return 0;
    }
    return `${data.value.div(total).shiftedBy(2).toFixed(1)}%`;
  }, [data, total]);

  const handlePercentageDisplay = useCallback(() => {
    if (percentageEl) {
      const parentEle = percentageEl.parentElement;

      if (
        parentEle &&
        parentEle.offsetWidth === 0 &&
        percentageEl.offsetWidth !== 0
      ) {
        // Component is still being initialized
        return;
      }

      if (
        !showPercentage ||
        (parentEle && parentEle.offsetWidth < percentageEl.offsetWidth)
      ) {
        percentageEl.hidden = true;
      } else {
        percentageEl.hidden = false;
      }
    }
  }, [percentageEl, showPercentage]);

  useEffect(() => {
    handlePercentageDisplay();
  }, [handlePercentageDisplay]);

  useWindowEvent("resize", handlePercentageDisplay);

  return (
    <>
      <div
        className={cn(
          "flex",
          "h-full",
          "items-center",
          "justify-center",
          "overflow-hidden",
          "flex-col",
          "flex-wrap",
          data.colorClassName
        )}
        style={{
          width: percentage,
        }}
        ref={setRefEle}
      >
        <span
          ref={setPercentageEl}
          className={cn("text-xs", "leading-5", "font-medium", "text-white")}
        >
          {percentage}
        </span>
      </div>
      {showPercentage && (
        <Tooltip
          parentElement={refEle}
          content={percentage}
          popperOptions={{ placement: "bottom" }}
        />
      )}
    </>
  );
};

interface ColorBarProps {
  className?: string;
  showPercentage?: boolean;
  total?: BigNumber;
  data: ColorBarData[];
}

const ColorBar: React.FC<ColorBarProps> = (props) => {
  const { className, data, showPercentage, total } = props;

  const calculatedTotal = useMemo(
    () =>
      total ??
      data.reduce((total, data) => total.plus(data.value), new BigNumber(0)),
    [data, total]
  );

  // Using grid to overlap the bars without using relative which breaks the tooltips
  return (
    <div
      className={cn(
        "grid",
        "grid-rows-1",
        "grid-cols-1",
        "h-full",
        "overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "row-start-1",
          "col-start-1",
          "block",
          "h-full",
          "w-full",
          "bg-app-grey"
        )}
      />
      <div className={cn("row-start-1", "col-start-1", "flex")}>
        {data.map((data, index) => (
          <ColorBarSection
            key={index}
            data={data}
            total={calculatedTotal}
            showPercentage={showPercentage}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorBar;
