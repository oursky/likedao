import { useMemo } from "react";

import { RegisterOptions } from "react-hook-form";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { useFormValidators } from "../../../hooks/useFormValidators";

export interface VoteProposalFormValues {
  proposalId: number;
  option: VoteOption;
  memo: string | null;
}

export const useVoteProposalFromModel = (): {
  registerOptions: Record<keyof VoteProposalFormValues, RegisterOptions>;
} => {
  const { requiredValidator, maxLengthValidator } = useFormValidators();

  const registerOptions = useMemo((): Record<
    keyof VoteProposalFormValues,
    RegisterOptions
  > => {
    return {
      proposalId: {
        required: requiredValidator,
      },
      option: {
        required: requiredValidator,
      },
      memo: {
        required: false,
        maxLength: maxLengthValidator(140),
      },
    };
  }, [requiredValidator, maxLengthValidator]);

  return {
    registerOptions,
  };
};
