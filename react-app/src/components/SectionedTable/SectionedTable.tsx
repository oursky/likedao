import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

const ItemContext = React.createContext<any>({});
interface ColumnProps<T> {
  titleId?: MessageID;
  className?: string;
  sortable?: boolean;
  children(item: T): React.ReactElement;
}

const Column: <T>(props: ColumnProps<T>) => React.ReactElement = (props) => {
  const { className } = props;
  const item = React.useContext(ItemContext);

  return (
    <td className={cn("whitespace-nowrap", "px-6", "py-4", className)}>
      {props.children(item)}
    </td>
  );
};

export interface SectionItem<T> {
  titleId: MessageID;
  className?: string;
  items: T[];
}

interface SectionProps<T> {
  columns: React.ReactNode | React.ReactNode[];
  section: SectionItem<T>;
}

const Section: <T>(props: SectionProps<T>) => React.ReactElement = (props) => {
  const { section, columns } = props;

  return (
    <>
      <tr>
        <th
          colSpan={React.Children.count(columns)}
          scope="colgroup"
          className={cn(
            "px-6",
            "py-2",
            "text-left",
            "text-xs",
            "leading-5",
            "font-medium",
            "uppercase",
            section.className
          )}
        >
          <LocalizedText messageID={section.titleId} />
        </th>
      </tr>
      {section.items.map((item, itemIdx) => (
        <tr key={itemIdx}>
          <ItemContext.Provider value={item}>{columns}</ItemContext.Provider>
        </tr>
      ))}
    </>
  );
};

interface SectionedTableProps<T> {
  sections: SectionItem<T>[];
  children:
    | React.ReactElement<ColumnProps<T>>
    | React.ReactElement<ColumnProps<T>>[];
}

const SectionedTable: <T>(
  props: SectionedTableProps<T>
) => React.ReactElement = (props) => {
  const { sections, children } = props;

  return (
    <div className={cn("inline-block", "min-w-full", "py-2", "align-middle")}>
      <div
        className={cn(
          "overflow-hidden",
          "shadow",
          "ring-1",
          "ring-black",
          "ring-opacity-5",
          "rounded-lg"
        )}
      >
        <table className="min-w-full">
          <thead className="bg-white">
            <tr>
              {React.Children.map(children, (c, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn("px-6", "py-3.5", "text-left")}
                >
                  {c.props.titleId && (
                    <span className={cn("text-sm", "leading-4", "font-medium")}>
                      <LocalizedText messageID={c.props.titleId} />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {sections.map((section, sectionIdx) => (
              <Section key={sectionIdx} section={section} columns={children} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { SectionedTable as Table, Column };
