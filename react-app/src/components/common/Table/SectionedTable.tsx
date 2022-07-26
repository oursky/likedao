import React, { useMemo } from "react";
import cn from "classnames";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";
import * as Table from "./Table";

export interface SectionItem<T> {
  titleId: MessageID;
  className?: string;
  items: T[];
}

const Section: <T>(
  props: Table.RowProps<SectionItem<T>>
) => React.ReactElement = (props) => {
  const { item, columns } = props;

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
            item.className
          )}
        >
          <LocalizedText messageID={item.titleId} />
        </th>
      </tr>
      {item.items.map((row, rowIdx) => (
        <Table.Row key={rowIdx} item={row} columns={columns} />
      ))}
    </>
  );
};

interface SectionedTableProps<T>
  extends Omit<Table.TableProps<SectionItem<T>>, "items"> {
  sections: SectionItem<T>[];
}

const SectionedTable: <T>(
  props: SectionedTableProps<T>
) => React.ReactElement = (props) => {
  const { children, sections, ...rest } = props;

  const visibleSections = useMemo(() => {
    return sections.filter((section) => section.items.length > 0);
  }, [sections]);

  return (
    <Table.Table {...rest} items={visibleSections} RowComponent={Section}>
      {children}
    </Table.Table>
  );
};

export { SectionedTable };
