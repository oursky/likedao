import { Profile } from "@desmoslabs/desmjs-types/desmos/profiles/v1beta1/models_profile";
import { BigNumberCoin } from "../../models/coin";

export interface Portfolio {
  profile: Profile | null;
  balance: BigNumberCoin;
  stakedBalance: BigNumberCoin;
  unstakingBalance: BigNumberCoin;
  availableBalance: BigNumberCoin;
  address: string;
}
