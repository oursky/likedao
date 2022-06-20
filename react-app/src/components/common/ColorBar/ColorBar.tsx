import React, { useMemo } from "react";
import cn from "classnames";

export interface ColorBarData {
  value: number;
  colorClassName: string;
}

interface ColorBarProps {
  className?: string;
  data: ColorBarData[];
}

const ColorBar: React.FC<ColorBarProps> = (props) => {
  const { className, data } = props;

  const total = useMemo(
    () => data.reduce((total, data) => total + data.value, 0),
    [data]
  );

  return (
    <div className={cn("flex", "h-1.5", className)}>
      {total !== 0 ? (
        data.map((data, index) => (
          <div
            key={index}
            className={cn("inline-block", "h-full", data.colorClassName)}
            style={{
              width: `${(data.value / total) * 100}%`,
            }}
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
