import React from "react";
import { format } from "date-fns";

const UTCDatetime: React.FC<{ date: Date; className?: string }> = ({
  date,
  className = "",
}) => {
  return (
    <time className={className} dateTime={date.toISOString()}>
      {format(date.toISOString().slice(0, -1), "YYYY-MM-DD HH:mm")} UTC
    </time>
  );
};

export default UTCDatetime;
