import { useCallback, useMemo } from "react";
import { ValidatorSigningInfo } from "cosmjs-types/cosmos/slashing/v1beta1/slashing";
import { useQueryClient } from "../providers/QueryClientProvider";

interface ISlashingAPI {
  getSigningInfo(consensusAddress: string): Promise<ValidatorSigningInfo>;
  getValidatorUptime(consensusAddress: string): Promise<number>;
}

export const useSlashingAPI = (): ISlashingAPI => {
  const { query, stargateQuery } = useQueryClient();

  const getSigningInfo = useCallback(
    async (consensusAddress: string) => {
      const signingInfoRes = await query.slashing.signingInfo(consensusAddress);
      if (!signingInfoRes.valSigningInfo) {
        throw new Error(`Failed to fetch signing info for ${consensusAddress}`);
      }
      return signingInfoRes.valSigningInfo;
    },
    [query.slashing]
  );

  /**
   * get validator's uptime ratio since last unjail block
   */
  const getValidatorUptime = useCallback(
    async (consensusAddress: string) => {
      const [signingInfo, height] = await Promise.all([
        getSigningInfo(consensusAddress),
        stargateQuery.getHeight(),
      ]);
      return (
        1 -
        signingInfo.missedBlocksCounter.toNumber() /
          (height - signingInfo.startHeight.toNumber())
      );
    },
    [getSigningInfo, stargateQuery]
  );

  return useMemo(
    () => ({
      getSigningInfo,
      getValidatorUptime,
    }),
    [getSigningInfo, getValidatorUptime]
  );
};
