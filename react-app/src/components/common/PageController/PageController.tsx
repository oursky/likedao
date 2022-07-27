import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import ReactPaginate from "react-paginate";
import { Icon, IconType } from "../Icons/Icons";
import LocalizedText from "../Localized/LocalizedText";

interface ClickEvent {
  index: number | null;
  selected: number;
  nextSelectedPage: number | undefined;
  event: object;
  isPrevious: boolean;
  isNext: boolean;
  isBreak: boolean;
  isActive: boolean;
}
interface PageBasedPageControllerProps {
  offsetBased: false;
  totalPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface OffsetBasedPageControllerProps {
  offsetBased: true;
  pageSize: number;
  totalItems: number;
  currentOffset: number;
  onPageChange: (offset: number) => void;
}

type PageControllerProps =
  | PageBasedPageControllerProps
  | OffsetBasedPageControllerProps;

const PageContoller: React.FC<PageControllerProps> = (props) => {
  const [currentPage, totalPage] = useMemo(() => {
    if (!props.offsetBased) {
      return [props.currentPage, props.totalPage];
    }

    return [
      Math.floor(props.currentOffset / props.pageSize),
      Math.ceil(props.totalItems / props.pageSize),
    ];
  }, [props]);

  const [canGoPrevious, canGoNext] = useMemo(() => {
    // If total page number is 0, it means there's something wrong with the param and hence can't control the pagination
    if (totalPage === 0) {
      return [false, false];
    }
    const page = currentPage + 1;
    return [page > 1, page < totalPage];
  }, [currentPage, totalPage]);

  const onPreviousClick = useCallback(() => {
    if (!canGoPrevious) return;

    if (props.offsetBased) {
      props.onPageChange(props.currentOffset - props.pageSize);
      return;
    }

    props.onPageChange(currentPage - 1);
  }, [canGoPrevious, currentPage, props]);

  const onNextClick = useCallback(() => {
    if (!canGoNext) return;

    if (props.offsetBased) {
      props.onPageChange(props.currentOffset + props.pageSize);
      return;
    }
    props.onPageChange(currentPage + 1);
  }, [canGoNext, currentPage, props]);

  const onPageChange = useCallback(
    (selectedItem: { selected: number }) => {
      if (props.offsetBased) {
        props.onPageChange(selectedItem.selected * props.pageSize);
        return;
      }
      props.onPageChange(selectedItem.selected + 1);
    },
    [props]
  );

  const onClick = useCallback(
    (event: ClickEvent) => {
      if (!event.isBreak) return true;

      // Next break is clicked
      if (event.nextSelectedPage === event.selected + 1) {
        return Math.floor(
          (totalPage - event.selected) / 2 + event.selected - 1
        );
      }

      // Previous break is clicked
      if (event.nextSelectedPage === event.selected - 1) {
        return Math.floor((event.selected - 1) / 2);
      }

      return true;
    },
    [totalPage]
  );

  return (
    <div className={cn("overflow-hidden", "w-full", "h-full")}>
      <div
        className={cn(
          "flex",
          "items-center",
          "justify-between",
          "px-4",
          "desktop:px-0",
          "overflow-x-auto"
        )}
      >
        <div
          className={cn(
            "mr-4",
            "w-0",
            "flex-1",
            "flex",
            "justify-start",
            "desktop:justify-end"
          )}
        >
          {canGoPrevious && (
            <button
              type="button"
              className={cn(
                "border-t-2",
                "border-transparent",
                "pt-4",
                "items-center",
                "text-sm",
                "font-medium",
                "text-gray-500",
                "hover:text-gray-700",
                "hover:border-gray-300",
                "inline-flex"
              )}
              onClick={onPreviousClick}
            >
              <Icon icon={IconType.ArrowNarrowLeft} width={20} height={20} />
              <span className={cn("ml-3", "hidden", "desktop:inline-block")}>
                <LocalizedText messageID="PaginationController.previous" />
              </span>
            </button>
          )}
        </div>
        <ReactPaginate
          containerClassName={cn("flex", "items-center")}
          pageRangeDisplayed={1}
          marginPagesDisplayed={1}
          pageClassName={cn("list-none")}
          pageLinkClassName={cn(
            "text-gray-500",
            "hover:text-gray-700",
            "hover:border-gray-300",
            "border-t-2",
            "border-transparent",
            "pt-4",
            "px-4",
            "inline-flex",
            "items-center",
            "text-sm",
            "font-medium"
          )}
          breakLabel="..."
          breakLinkClassName={cn(
            "border-transparent",
            "text-gray-500",
            "border-t-2",
            "pt-4",
            "px-4",
            "inline-flex",
            "items-center",
            "text-sm",
            "font-medium",
            "leading-[0]"
          )}
          activeLinkClassName={cn(
            "hover:border-app-green",
            "!border-app-green",
            "!text-app-green",
            "border-t-2"
          )}
          pageCount={totalPage}
          nextClassName={cn("hidden")}
          nextLabel={null}
          previousClassName={cn("hidden")}
          previousLabel={null}
          disableInitialCallback={true}
          forcePage={currentPage}
          onPageChange={onPageChange}
          onClick={onClick}
        />
        <div
          className={cn(
            "ml-4",
            "w-0",
            "flex-1",
            "flex",
            "justify-end",
            "desktop:justify-start"
          )}
        >
          {canGoNext && (
            <button
              type="button"
              className={cn(
                "border-t-2",
                "border-transparent",
                "pt-4",
                "items-center",
                "text-sm",
                "font-medium",
                "text-gray-500",
                "hover:text-gray-700",
                "hover:border-gray-300",
                "inline-flex"
              )}
              disabled={!canGoNext}
              onClick={onNextClick}
            >
              <span className={cn("mr-3", "hidden", "desktop:inline-block")}>
                <LocalizedText messageID="PaginationController.next" />
              </span>
              <Icon icon={IconType.ArrowNarrowRight} width={20} height={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageContoller;
