import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { useWindowEvent } from "../../../hooks/useWindowEvent";

export interface ColorBarData {
  value: BigNumber;
  colorClassName: string;
}

interface ColorBarSectionProps {
  data: ColorBarData;
  total: BigNumber;
  showPercentage?: boolean;
}

const ColorBarSection: React.FC<ColorBarSectionProps> = (props) => {
  const { data, total, showPercentage } = props;
  const [percentageEl, setPercentageEl] = useState<HTMLSpanElement | null>(
    null
  );

  const percentage = useMemo(() => {
    return data.value.div(total).shiftedBy(2).toFixed(1);
  }, [data, total]);

  const handlePercentageDisplay = useCallback(() => {
    if (percentageEl) {
      const parentEle = percentageEl.parentElement;
      if (
        !showPercentage ||
        (parentEle && parentEle.offsetWidth < percentageEl.offsetWidth)
      ) {
        percentageEl.hidden = true;
      }
    }
  }, [percentageEl, showPercentage]);

  useEffect(() => {
    handlePercentageDisplay();
  }, [handlePercentageDisplay]);

  useWindowEvent("resize", handlePercentageDisplay);

  return (
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
        width: `${percentage}%`,
      }}
    >
      <span
        ref={setPercentageEl}
        className={cn("text-xs", "leading-5", "font-medium", "text-white")}
      >
        {percentage}%
      </span>
    </div>
  );
};

interface ColorBarProps {
  className?: string;
  showPercentage?: boolean;
  data: ColorBarData[];
}

const ColorBar: React.FC<ColorBarProps> = (props) => {
  const { className, data, showPercentage } = props;

  const total = useMemo(
    () =>
      data.reduce((total, data) => total.plus(data.value), new BigNumber(0)),
    [data]
  );

  return (
    <div className={cn("flex", "h-full", "overflow-hidden", className)}>
      {!total.eq(0) ? (
        data.map((data, index) => (
          <ColorBarSection
            key={index}
            data={data}
            total={total}
            showPercentage={showPercentage}
          />
        ))
      ) : (
        <div
          className={cn("inline-block", "h-full", "w-full", "bg-likecoin-grey")}
        />
      )}
    </div>
  );
};

export default ColorBar;
