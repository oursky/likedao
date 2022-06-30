import { Duration } from "cosmjs-types/google/protobuf/duration";

/**
 * Convert cosmjs Duration to days
 */
export function convertDurationToDays(duration: Duration): number {
  return duration.seconds.div(60 * 60 * 24).toInt();
}
