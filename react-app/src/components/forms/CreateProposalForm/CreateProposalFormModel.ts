import { useMemo } from "react";
import { RegisterOptions } from "react-hook-form";
import { useFormValidators } from "../../../hooks/useFormValidators";
import { ProposalType } from "../../../models/cosmos/gov";
import { useLocale } from "../../../providers/AppLocaleProvider";

export interface CreateProposalFormValues {
  type: ProposalType;
  title: string;
  description: string;
}

export const useCreateProposalFormModel = (): {
  registerOptions: Record<keyof CreateProposalFormValues, RegisterOptions>;
} => {
  const { requiredValidator, maxLengthValidator } = useFormValidators();
  const { translate } = useLocale();

  const registerOptions = useMemo((): Record<
    keyof CreateProposalFormValues,
    RegisterOptions
  > => {
    return {
      type: {
        required: requiredValidator,
        validate: {
          oneOfValidTypes: (v: any) => {
            return (
              Object.values(ProposalType).includes(v) ||
              translate("CreateNewProposalForm.fields.invalidType")
            );
          },
        },
      },
      title: {
        required: requiredValidator,
        // https://github.com/cosmos/cosmos-sdk/blob/55054282d2df794d9a5fe2599ea25473379ebc3d/x/gov/types/v1beta1/proposal.go#L169
        maxLength: maxLengthValidator(140),
      },
      description: {
        required: false,
        // https://github.com/cosmos/cosmos-sdk/blob/55054282d2df794d9a5fe2599ea25473379ebc3d/x/gov/types/v1beta1/proposal.go#L168
        maxLength: maxLengthValidator(10000),
      },
    };
  }, [requiredValidator, maxLengthValidator, translate]);

  return { registerOptions };
};
