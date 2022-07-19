import { Duration } from "cosmjs-types/google/protobuf/duration";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";

/**
 * Convert cosmjs Duration to days
 */
export function convertDurationToDays(duration: Duration): number {
  return duration.seconds.div(60 * 60 * 24).toInt();
}

/**
 * Convert cosmjs-types Timestamp to js Date object
 *
 * see: cosmjs-types/google/protobuf/timestamp
 */
export function convertTimestampToDate(timestamp: Timestamp): Date {
  const date = new Date(0);
  date.setUTCSeconds(timestamp.seconds.toNumber());
  return date;
}
