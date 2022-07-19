import React, { useCallback } from "react";
import cn from "classnames";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { RadioGroup } from "@headlessui/react";
import { BaseFormFieldProps, BaseFormField } from "./BaseFormField";

export interface Selection<T> {
  label: string;
  value: T;
  className?: string;
}

interface SelectionOptionProps<T> {
  className?: string;
  item: Selection<T>;
  onSelect: (value: T) => void;
}
function SelectionOptionImpl<T>(
  props: SelectionOptionProps<T>,
  ref: React.Ref<HTMLButtonElement>
) {
  const { item, className, onSelect } = props;

  const handleSelect = useCallback(() => {
    onSelect(item.value);
  }, [item, onSelect]);

  return (
    <RadioGroup.Option value={item.value}>
      {({ checked }) => (
        <button
          type="button"
          ref={ref}
          className={cn(
            "flex",
            "items-center",
            "justify-start",
            "border-2",
            "border-app-lightgreen",
            "shadow-sm",
            "py-4",
            "px-6",
            "rounded-lg",
            checked
              ? cn(
                  "bg-gradient-to-r",
                  "from-app-gradient-from",
                  "to-app-gradient-to"
                )
              : "bg-app-lightergrey",
            className,
            item.className
          )}
          onClick={handleSelect}
        >
          <span className={cn("text-sm", "leading-5", "font-medium")}>
            {item.label}
          </span>
        </button>
      )}
    </RadioGroup.Option>
  );
}
const SelectionOption = React.forwardRef(SelectionOptionImpl) as <T>(
  props: SelectionOptionProps<T>,
  ref: React.Ref<HTMLButtonElement>
) => React.ReactElement;

interface SelectionFieldProps<T, U extends keyof T> extends BaseFormFieldProps {
  selections: Selection<T[U]>[];
  name: Path<T>;
  control: Control<T>;
  defaultValue?: T[U];
  registerOptions: RegisterOptions;
}

const SelectionFormField: <T extends FieldValues>(
  props: SelectionFieldProps<T, keyof T>
) => React.ReactElement = (props) => {
  const { selections, name, registerOptions, defaultValue, control, ...rest } =
    props;

  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
    rules: registerOptions,
    defaultValue: defaultValue,
  });

  return (
    <BaseFormField {...rest}>
      <RadioGroup value={value} onChange={onChange} onBlur={onBlur}>
        <div className={cn("flex", "flex-col", "space-y-4")}>
          {selections.map((item, index) => (
            <SelectionOption
              className={cn("w-full")}
              key={`${item.label}-${index}`}
              item={item}
              onSelect={onChange}
            />
          ))}
        </div>
      </RadioGroup>
    </BaseFormField>
  );
};

export { SelectionFormField };
