import React, { useCallback, useMemo, useRef } from "react";
import MDEditor, {
  ContextStore,
  ICommand,
  commands as MDEditorCommands,
  MDEditorProps,
} from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import cn from "classnames";

interface MarkdownEditorProps
  extends Omit<MDEditorProps, "onChange" | "value"> {
  containerClassName?: string;
  value: string;
  onValueChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const { containerClassName, className, value, onValueChange, ...rest } =
    props;
  const ref = useRef<ContextStore>(null);

  const onChange = useCallback(
    (
      value?: string,
      _?: React.ChangeEvent<HTMLTextAreaElement>,
      __?: ContextStore
    ) => {
      onValueChange(value ?? "");
    },
    [onValueChange]
  );

  const filterCommands = useCallback((cmd: ICommand, _: boolean) => {
    if (cmd.name === MDEditorCommands.title2.name) {
      return MDEditorCommands.group(
        [
          MDEditorCommands.title1,
          MDEditorCommands.title2,
          MDEditorCommands.title3,
          MDEditorCommands.title4,
          MDEditorCommands.title5,
          MDEditorCommands.title6,
        ],
        {
          name: "title",
          groupName: "title",
          buttonProps: { "aria-label": "Insert title" },
        }
      );
    }
    return cmd;
  }, []);

  const extraCommands = useMemo((): ICommand[] => {
    return [
      MDEditorCommands.codeEdit,
      MDEditorCommands.codeLive,
      MDEditorCommands.codePreview,
    ];
  }, []);

  return (
    <div data-color-mode="light" className={cn("w-full", containerClassName)}>
      <MDEditor
        {...rest}
        ref={ref}
        value={value}
        className={cn("w-full", className)}
        onChange={onChange}
        visibleDragbar={false}
        preview="edit"
        fullscreen={false}
        toolbarHeight={50}
        height={400}
        commandsFilter={filterCommands}
        extraCommands={extraCommands}
        previewOptions={{ rehypePlugins: [rehypeSanitize] }}
      />
    </div>
  );
};

export default MarkdownEditor;
