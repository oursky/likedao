import { useMemo } from "react";

import { RegisterOptions } from "react-hook-form";
import { useFormValidators } from "../../../hooks/useFormValidators";
import { VoteOption } from "../../../models/cosmos/gov";

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
