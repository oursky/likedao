import React, { useCallback } from "react";
import cn from "classnames";
import { Icon, IconType } from "../Icons/Icons";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

export interface ColumnOrder {
  id: string;
  direction: "asc" | "desc";
}

interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
  isHeader?: boolean;
}

interface TableCellProps {
  className?: string;
  children: React.ReactNode;
}

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

const SortIndicator: React.FC<Pick<ColumnOrder, "direction">> = (props) => {
  const { direction } = props;

  if (direction === "asc") {
    return <Icon icon={IconType.ChevronUp} width={24} height={24} />;
  }

  return <Icon icon={IconType.ChevronDown} width={24} height={24} />;
};

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
}) => {
  return <thead className={cn("bg-white", className)}>{children}</thead>;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <th
      scope="col"
      className={cn(
        "font-medium",
        "tracking-wider",
        "leading-4",
        "uppercase",
        "text-xs",
        "py-3",
        "px-6",
        "text-left",
        "text-likecoin-green",
        className
      )}
    >
      {children}
    </th>
  );
};

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  isHeader,
}) => {
  return (
    <tr
      className={cn(
        !isHeader && "text-sm font-normal leading-5 text-gray-500",
        className
      )}
    >
      {children}
    </tr>
  );
};

interface SortableColumnHeaderProps {
  id: string;
  titleId?: MessageID;
  className?: string;
  sortable?: boolean;
}

interface ColumnSortContextValue {
  order?: ColumnOrder;
  setOrder?: (order: ColumnOrder) => void;
}

export const ColumnSortContext = React.createContext<ColumnSortContextValue>(
  {} as any
);

export const SortableColumnHeader: React.FC<SortableColumnHeaderProps> = (
  props
) => {
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

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
}) => {
  return <td className={cn("px-6", className)}>{children}</td>;
};

const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "inline-block overflow-x-auto rounded-lg w-full min-w-full shadow-md",
        className
      )}
    >
      <table className={cn("table-auto rounded-lg w-full")}>{children}</table>
    </div>
  );
};

export default Table;
