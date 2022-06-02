import { useMemo } from "react";

import { RegisterOptions } from "react-hook-form";

export interface CollectRewardsFormValues {
  amount: string;
}

export const useCollectRewardsFormModel = (): {
  registerOptions: Record<keyof CollectRewardsFormValues, RegisterOptions>;
} => {
  const registerOptions = useMemo((): Record<
    keyof CollectRewardsFormValues,
    RegisterOptions
  > => {
    return {
      amount: {
        required: false,
      },
    };
  }, []);

  return { registerOptions };
};
