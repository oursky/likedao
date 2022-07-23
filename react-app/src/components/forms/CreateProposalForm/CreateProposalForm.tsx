import React, { useMemo } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import LocalizedText from "../../common/Localized/LocalizedText";
import Divider from "../../common/Divider/Divider";
import * as FormField from "../../common/Form";
import { ProposalType } from "../../../models/cosmos/gov";
import AppButton from "../../common/Buttons/AppButton";
import { useLocale } from "../../../providers/AppLocaleProvider";
import Paper from "../../common/Paper/Paper";
import {
  CreateProposalFormValues,
  useCreateProposalFormModel,
} from "./CreateProposalFormModel";

interface CreateProposalFormProps {
  onSubmit: (data: CreateProposalFormValues) => void;
}

const CreateProposalForm: React.FC<CreateProposalFormProps> = (props) => {
  const { onSubmit } = props;
  const { translate } = useLocale();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<CreateProposalFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: undefined,
  });

  const { registerOptions } = useCreateProposalFormModel();

  const proposalTypeItems = useMemo(() => {
    return [
      {
        label: translate("CreateNewProposalForm.proposalType.signaling"),
        value: ProposalType.Signaling,
      },
    ];
  }, [translate]);

  return (
    <Paper className={cn("flex", "flex-col")}>
      <h1 className={cn("text-lg", "leading-6", "font-bold", "text-app-black")}>
        <LocalizedText messageID="CreateNewProposalForm.title" />
      </h1>
      <span
        className={cn(
          "mt-1",
          "text-sm",
          "leading-5",
          "font-normal",
          "text-app-darkgrey"
        )}
      >
        <LocalizedText messageID="CreateNewProposalForm.description" />
      </span>
      <Divider className={cn("my-5")} />
      <form
        className={cn("flex", "flex-col", "gap-y-5")}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField.Dropdown
          items={proposalTypeItems}
          label="CreateNewProposalForm.fields.type"
          direction="horizontal"
          size="small"
          name="type"
          control={control}
          registerOptions={registerOptions.type}
          errorMessage={errors.type?.message}
        />
        <Divider />
        <FormField.TextInput
          label="CreateNewProposalForm.fields.title"
          direction="horizontal"
          size="small"
          registerReturn={register("title", registerOptions.title)}
          errorMessage={errors.title?.message}
        />
        <Divider />
        <FormField.Markdown
          label="CreateNewProposalForm.fields.description"
          size="small"
          name="description"
          registerOptions={registerOptions.description}
          control={control}
          errorMessage={errors.description?.message}
        />
        <Divider />
        <AppButton
          className={cn("self-end")}
          size="regular"
          theme="primary"
          messageID="CreateNewProposalForm.submit"
          disabled={!isValid}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={handleSubmit(onSubmit)}
        />
      </form>
    </Paper>
  );
};

export default CreateProposalForm;
