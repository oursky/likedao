import React from "react";
import { formatInTimeZone } from "date-fns-tz";

const UTCDatetime: React.FC<{ date: Date; className?: string }> = ({
  date,
  className = "",
}) => {
  return (
    <time className={className} dateTime={date.toISOString()}>
      {formatInTimeZone(date, "UTC", "yyyy-MM-dd HH:mm")} UTC
    </time>
  );
};

export default UTCDatetime;
