import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";
import { Icon, IconType } from "../common/Icons/Icons";

export interface ColumnOrder {
  id: string;
  direction: "asc" | "desc";
}

const SortIndicator: React.FC<Pick<ColumnOrder, "direction">> = (props) => {
  const { direction } = props;

  if (direction === "asc") {
    return <Icon icon={IconType.ChevronUp} width={24} height={24} />;
  }

  return <Icon icon={IconType.ChevronDown} width={24} height={24} />;
};
interface ColumnSortContextValue {
  order?: ColumnOrder;
  setOrder?: (order: ColumnOrder) => void;
}

const ColumnSortContext = React.createContext<ColumnSortContextValue>(
  {} as any
);
const ItemContext = React.createContext<any>({});
interface ColumnProps<T> {
  id: string;
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

type ColumnHeaderProps = Omit<ColumnProps<any>, "children" | "className">;
const ColumnHeader: React.FC<ColumnHeaderProps> = (props) => {
  const { id, titleId, sortable } = props;
  const { order, setOrder } = React.useContext(ColumnSortContext);

  const handleSort = useCallback(() => {
    let direction: ColumnOrder["direction"] = "asc";
    if (order?.id === id) {
      direction = order.direction === "asc" ? "desc" : "asc";
    }
    setOrder?.({
      id,
      direction,
    });
  }, [id, order, setOrder]);

  return (
    <th
      scope="col"
      className={cn("w-80", "min-w-max", "px-6", "py-3.5", "text-left")}
    >
      <button
        type="button"
        disabled={!sortable}
        onClick={handleSort}
        className={cn("flex", "flex-row", "items-center")}
      >
        {titleId && (
          <span
            className={cn(
              "whitespace-nowrap",
              "text-xs",
              "leading-4",
              "font-medium",
              "uppercase",
              order?.id === id ? "text-likecoin-green" : "text-gray-500"
            )}
          >
            <LocalizedText messageID={titleId} />
          </span>
        )}
        {sortable && order?.id === id && (
          <SortIndicator direction={order.direction} />
        )}
      </button>
    </th>
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
  sortOrder?: ColumnOrder;
  onSort?: (order: ColumnOrder) => void;
  children:
    | React.ReactElement<ColumnProps<T>>
    | React.ReactElement<ColumnProps<T>>[];
}

const SectionedTable: <T>(
  props: SectionedTableProps<T>
) => React.ReactElement = (props) => {
  const { sections, children, sortOrder, onSort } = props;

  const columnSortContextValue = useMemo(
    () => ({
      order: sortOrder,
      setOrder: onSort,
    }),
    [sortOrder, onSort]
  );

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
              <ColumnSortContext.Provider value={columnSortContextValue}>
                {React.Children.map(children, (column, index) => (
                  <ColumnHeader {...column.props} key={index} />
                ))}
              </ColumnSortContext.Provider>
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
