/* eslint-disable @typescript-eslint/no-floating-promises */
import { renderHook } from "@testing-library/react-hooks";
import { BigNumber } from "bignumber.js";
import { useStakingAPI } from "../stakingAPI";
const WALLET_ADDRESS = "like1ewpwcdfgsdfdu0jj2unwhjjl58yshm9xnvr9c2";

jest.mock("../../providers/WalletProvider", () => ({
  useWallet: () => ({}),
}));
jest.mock("../../providers/QueryClientProvider", () => ({
  useQueryClient: () => {
    /**
     * https://stackoverflow.com/a/69721696
     */
    function intToArray(i: number) {
      return Uint8Array.of(
        (i & 0xff000000) >> 24,
        (i & 0x00ff0000) >> 16,
        (i & 0x0000ff00) >> 8,
        (i & 0x000000ff) >> 0
      );
    }
    const makeRespond = (n: number) => {
      const respond = [];
      for (let i = 0; i < n; i++) {
        respond.push({
          entries: [
            {
              balance: "1000000000000000000000000000",
            },
          ],
        });
      }
      return respond;
    };

    return {
      query: {
        staking: {
          delegatorUnbondingDelegations: async (
            _delegatorAddress: string,
            paginationKey?: Uint8Array
          ) => {
            // console.log(delegatorAddress, paginationKey);
            if (paginationKey) {
              return {
                unbondingResponses: makeRespond(2),
              };
            }
            return {
              unbondingResponses: makeRespond(2),
              pagination: {
                nextKey: intToArray(1),
              },
            };
          },
        },
      },
    };
  },
}));

describe("useStaking", () => {
  describe("getAmountUnstaking", () => {
    it("should sum amount of all unbounding entries", () => {
      const { result } = renderHook(() => useStakingAPI());

      result.current.getUnstakingAmount(WALLET_ADDRESS).then(({ amount }) => {
        expect(amount).toStrictEqual(new BigNumber(4000000000000000000));
      });
    });
  });
});
