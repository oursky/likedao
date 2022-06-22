import React, { useMemo } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import AppButton from "../../common/Buttons/AppButton";
import * as FormField from "../../common/Form";
import { useLocale } from "../../../providers/AppLocaleProvider";
import { Selection } from "../../common/Form/SelectionFormField";
import {
  useVoteProposalFromModel,
  VoteProposalFormValues,
} from "./VoteProposalFormModel";

interface VoteProposalFormProps {
  className?: string;
  proposalId: number;
  onCancel: () => void;
  onSubmit: (data: VoteProposalFormValues) => void;
}

const VoteProposalForm: React.FC<VoteProposalFormProps> = (props) => {
  const { className, proposalId, onCancel, onSubmit } = props;
  const { translate } = useLocale();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VoteProposalFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      proposalId,
    },
  });

  const { registerOptions } = useVoteProposalFromModel();

  const voteOptionSelections = useMemo((): Selection<VoteOption>[] => {
    return [
      {
        label: translate("proposal.voteOption.yes"),
        value: VoteOption.VOTE_OPTION_YES,
        className: "text-likecoin-green",
      },
      {
        label: translate("proposal.voteOption.no"),
        value: VoteOption.VOTE_OPTION_NO,
        className: "text-likecoin-vote-color-no",
      },
      {
        label: translate("proposal.voteOption.noWithVeto"),
        value: VoteOption.VOTE_OPTION_NO_WITH_VETO,
        className: "text-likecoin-vote-color-veto",
      },
      {
        label: translate("proposal.voteOption.abstain"),
        value: VoteOption.VOTE_OPTION_ABSTAIN,
        className: "text-likecoin-vote-color-abstain",
      },
    ];
  }, [translate]);

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.Selection
        selections={voteOptionSelections}
        name="option"
        registerOptions={registerOptions.option}
        control={control}
        errorMessage={errors.option?.message}
      />

      <FormField.TextInput
        label="SendTokenModal.fields.memo"
        registerReturn={register("memo", registerOptions.memo)}
        errorMessage={errors.memo?.message}
      />

      <div className={cn("flex", "flex-row", "gap-x-2.5", "self-end")}>
        <AppButton
          theme="secondary"
          size="regular"
          onClick={onCancel}
          messageID="TransactionModal.cancel"
        />
        <AppButton
          theme="primary"
          size="regular"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={handleSubmit(onSubmit)}
          messageID="TransactionModal.next"
        />
      </div>
    </form>
  );
};

export default VoteProposalForm;
