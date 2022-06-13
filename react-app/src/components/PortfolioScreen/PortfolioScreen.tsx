import React, { useState, useEffect, useCallback } from "react";
import cn from "classnames";
import { Bech32 } from "@cosmjs/encoding";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useCosmos } from "../../api/cosmosAPI";
import { useStaking } from "../../api/stakingAPI";
import { useQueryClient } from "../../providers/QueryClientProvider";
import PortfolioPanel, { Portfolio } from "./PortfolioPanel";

const PortfolioScreen: React.FC = () => {
  const wallet = useWallet();
  const cosmosAPI = useCosmos();
  const staking = useStaking();
  const { desmosQuery } = useQueryClient();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) return;
    try {
      // TODO: call apis concurrently
      const balance = await cosmosAPI.getBalance();
      const stakingBalance = await staking.getBalanceStaked(
        wallet.account.address
      );
      const unstakingBalance = await staking.getUnstakingAmount(
        wallet.account.address
      );

      const profile = await desmosQuery.getProfile(
        Bech32.encode("desmos", Bech32.decode(wallet.account.address).data)
      );

      setPortfolio({
        profile,
        balance,
        unstakingBalance,
        stakingBalance,
        address: wallet.account.address,
      });
    } catch (err: unknown) {
      console.error("Failed to fetch user balance =", err);
    }
  }, [wallet, staking, cosmosAPI, desmosQuery]);

  useEffect(() => {
    fetchPortfolio().catch((err) => {
      console.log("Failed to portfolio =", err);
    });
  }, [fetchPortfolio]);

  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel portfolio={portfolio} />
    </div>
  );
};

export default PortfolioScreen;
