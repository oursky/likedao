import React, { useState, useEffect, useCallback } from "react";
import cn from "classnames";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useCosmos } from "../../api/cosmosAPI";
import { useStaking } from "../../api/stakingAPI";
import PortfolioPanel, { Portfolio } from "./PortfolioPanel";

const PortfolioScreen: React.FC = () => {
  const wallet = useWallet();
  const cosmosAPI = useCosmos();
  const staking = useStaking();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) return;
    try {
      // TODO: call apis concurrently
      const balance = await cosmosAPI.getBalance();
      const stakingBalance = await cosmosAPI.getStakingBalance();
      const unstakingBalance = await staking.getUnstakingAmount(
        wallet.account.address
      );

      setPortfolio({
        balance,
        unstakingBalance,
        stakingBalance,
        address: wallet.account.address,
      });
    } catch (err: unknown) {
      console.error("Failed to fetch user balance =", err);
    }
  }, [wallet, staking, cosmosAPI]);

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
