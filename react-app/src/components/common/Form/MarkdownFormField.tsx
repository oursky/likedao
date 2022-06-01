import React from "react";
import cn from "classnames";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import MarkdownEditor from "../../MarkdownEditor/MarkdownEditor";
import { BaseFormFieldProps, BaseFormField } from "./BaseFormField";

interface MarkdownFormFieldProps<T> extends BaseFormFieldProps {
  name: Path<T>;
  control: Control<T>;
  registerOptions: RegisterOptions;
  isError?: boolean;
}

const MarkdownFormField: <T extends FieldValues>(
  props: MarkdownFormFieldProps<T>
) => React.ReactElement = (props) => {
  const { registerOptions, name, control, errorMessage, ...rest } = props;

  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
    rules: registerOptions,
  });

  return (
    <BaseFormField {...rest} errorMessage={errorMessage}>
      <MarkdownEditor
        containerClassName={cn("mt-5", "mb-1")}
        value={value}
        onValueChange={onChange}
        onBlur={onBlur}
      />
    </BaseFormField>
  );
};

export { MarkdownFormField };
