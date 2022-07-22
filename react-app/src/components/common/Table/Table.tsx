import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";
import { Icon, IconType } from "../Icons/Icons";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

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

export const ColumnSortContext = React.createContext<ColumnSortContextValue>(
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

type ColumnHeaderProps = Omit<ColumnProps<any>, "children">;
export const ColumnHeader: React.FC<ColumnHeaderProps> = (props) => {
  const { id, titleId, sortable, className } = props;
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
      className={cn(
        "w-80",
        "min-w-max",
        "px-6",
        "py-3.5",
        "text-left",
        "bg-gray-50",
        className
      )}
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
              order?.id === id ? "text-app-green" : "text-gray-500"
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

export interface RowProps<T> {
  item: T;
  columns: React.ReactNode | React.ReactNode[];
}

const Row: <T>(props: RowProps<T>) => React.ReactElement = (props) => {
  const { item, columns } = props;
  return (
    <tr>
      <ItemContext.Provider value={item}>{columns}</ItemContext.Provider>
    </tr>
  );
};

export interface TableProps<T> {
  items: T[];
  isLoading?: boolean;
  emptyMessageID?: MessageID;
  sortOrder?: ColumnOrder;
  RowComponent?: React.ComponentType<RowProps<T>>;
  onSort?: (order: ColumnOrder) => void;
  children:
    | React.ReactElement<ColumnProps<T>>
    | React.ReactElement<ColumnProps<T>>[];
}

const Table: <T>(props: TableProps<T>) => React.ReactElement = (props) => {
  const {
    items,
    children,
    emptyMessageID,
    isLoading,
    sortOrder,
    onSort,
    RowComponent = Row,
  } = props;

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
          "overflow-x-auto",
          "shadow",
          "ring-1",
          "ring-black",
          "ring-opacity-5",
          "rounded-lg"
        )}
      >
        <table className="min-w-full">
          <thead className={cn("bg-white", "border-b")}>
            <tr>
              <ColumnSortContext.Provider value={columnSortContextValue}>
                {React.Children.map(children, (column, index) => (
                  <ColumnHeader {...column.props} key={index} />
                ))}
              </ColumnSortContext.Provider>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={React.Children.count(children)}>
                  <div
                    className={cn(
                      "w-full",
                      "h-96",
                      "flex",
                      "items-center",
                      "justify-center"
                    )}
                  >
                    <LoadingSpinner className={cn("h-16", "w-full")} />
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={React.Children.count(children)}>
                  <div
                    className={cn(
                      "h-96",
                      "flex",
                      "items-center",
                      "justify-center"
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold",
                        "text-xl",
                        "leading-5",
                        "text-black"
                      )}
                    >
                      <LocalizedText
                        messageID={emptyMessageID ?? "SectionedTable.noItems"}
                      />
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, itemIdx) => (
                <RowComponent key={itemIdx} item={item} columns={children} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Table, Column, Row };
