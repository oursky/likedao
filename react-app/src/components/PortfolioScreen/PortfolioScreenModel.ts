import { Profile } from "@desmoslabs/desmjs-types/desmos/profiles/v1beta1/models_profile";
import { BigNumberCoin } from "../../models/coin";

export interface Portfolio {
  profile: Profile | null;
  balance: BigNumberCoin;
  balanceStaked: BigNumberCoin;
  balanceUnstaking: BigNumberCoin;
  address: string;
}
