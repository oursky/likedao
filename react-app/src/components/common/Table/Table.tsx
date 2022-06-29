import React from "react";
import cn from "classnames";

interface TableHeadProps {
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

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
}) => {
  return <thead className={cn("bg-white", className)}>{children}</thead>;
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

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
}) => {
  return <td className={cn("px-6", className)}>{children}</td>;
};

const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <table className={cn("min-w-full rounded-lg shadow-md", className)}>
      {children}
    </table>
  );
};

export default Table;
