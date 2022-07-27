import React, { Fragment, useCallback, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import cn from "classnames";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { Icon, IconType } from "../Icons/Icons";
import {
  BaseFormFieldProps,
  BaseFormField,
  FormFieldSize,
} from "./BaseFormField";

function getInputClassNameBySize(size: FormFieldSize): string {
  switch (size) {
    case "regular":
      return cn("py-3", "px-4");
    case "small":
      return cn("py-2", "px-3");
    default:
      throw new Error(`Unknown form field size`);
  }
}

export interface DropdownItem<T> {
  label: string;
  value: T;
}

interface DropdownItemProps<T> {
  item: DropdownItem<T>;
  onSelect: (value: T) => void;
}
function DropDownItemImpl<T>(
  props: DropdownItemProps<T>,
  ref: React.Ref<HTMLButtonElement>
) {
  const { item, onSelect, ...rest } = props;

  const onItemSelect = useCallback(() => {
    onSelect(item.value);
  }, [onSelect, item]);

  return (
    <Menu.Item>
      {({ active }) => (
        <button
          {...rest}
          ref={ref}
          type="button"
          className={cn(
            active ? cn("bg-gray-100", "text-gray-900") : "text-gray-700",
            "block",
            "px-4",
            "py-2",
            "text-sm",
            "text-left"
          )}
          onClick={onItemSelect}
        >
          {item.label}
        </button>
      )}
    </Menu.Item>
  );
}
const DropDownItem = React.forwardRef(DropDownItemImpl) as <T>(
  props: DropdownItemProps<T>,
  ref: React.Ref<HTMLButtonElement>
) => React.ReactElement;
interface DropdownFormFieldProps<T, U extends keyof T>
  extends BaseFormFieldProps {
  items: DropdownItem<T[U]>[];
  name: Path<T>;
  control: Control<T>;
  registerOptions: RegisterOptions;
}

const DropdownFormField: <T extends FieldValues>(
  props: DropdownFormFieldProps<T, keyof T>
) => React.ReactElement = (props) => {
  const {
    items,
    registerOptions,
    name,
    control,
    size = "regular",
    ...rest
  } = props;

  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
    rules: registerOptions,
    defaultValue: items[0].value,
  });

  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === value)!;
  }, [items, value]);

  return (
    <BaseFormField {...rest} size={size}>
      <Menu
        as="div"
        className={cn(
          "relative",
          "inline-block",
          "text-left",
          "w-full",
          "desktop:max-w-xs"
        )}
        onBlur={onBlur}
      >
        <div className={cn("flex", "items-center")}>
          <Menu.Button
            className={cn(
              "inline-flex",
              "w-full",
              "justify-between",
              "items-center",
              "rounded-md",
              "border",
              "border-gray-300",

              getInputClassNameBySize(size)
            )}
          >
            {selectedItem.label}
            <Icon icon={IconType.DropDown} />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={cn(
              "absolute",
              "mt-2",
              "divide-y",
              "divide-gray-100",
              "rounded-md",
              "bg-white shadow-lg",
              "right-0",
              "bg-white",
              "z-10",
              "ring-1",
              "ring-black",
              "ring-opacity-5",
              "focus:outline-none",
              "w-full",
              "max-w-xs"
            )}
          >
            <div className={cn("flex", "flex-col", "py-1")}>
              {items.map((item, index) => (
                <DropDownItem
                  key={`${item.label}-${index}`}
                  item={item}
                  onSelect={onChange}
                />
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </BaseFormField>
  );
};

export { DropdownFormField };
