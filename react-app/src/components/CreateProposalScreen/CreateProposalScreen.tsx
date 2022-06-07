import React, { useCallback } from "react";
import cn from "classnames";
import CreateProposalForm from "../forms/CreateProposalForm/CreateProposalForm";
import { CreateProposalFormValues } from "../forms/CreateProposalForm/CreateProposalFormModel";

const CreateProposalScreen: React.FC = () => {
  // TODO: Handle submission
  const onSubmit = useCallback((values: CreateProposalFormValues) => {
    console.log(values);
  }, []);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "flex-1",
        "bg-white",
        "rounded-lg",
        "drop-shadow",
        "px-5",
        "py-6"
      )}
    >
      <CreateProposalForm onSubmit={onSubmit} />
    </div>
  );
};

export default CreateProposalScreen;
