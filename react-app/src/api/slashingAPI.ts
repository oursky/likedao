import { useCallback, useMemo } from "react";
import { ValidatorSigningInfo } from "cosmjs-types/cosmos/slashing/v1beta1/slashing";
import { useQueryClient } from "../providers/QueryClientProvider";

interface ISlashingAPI {
  getSigningInfo(consensusAddress: string): Promise<ValidatorSigningInfo>;
}

export const useSlashingAPI = (): ISlashingAPI => {
  const { query } = useQueryClient();

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

  return useMemo(
    () => ({
      getSigningInfo,
    }),
    [getSigningInfo]
  );
};
