import React from "react";
import { FormattedMessage } from "@oursky/react-messageformat";
import {
  MessageID,
  MessageArgs,
  MessageComponents,
} from "../../../i18n/LocaleModel";

interface Props {
  messageID: MessageID;
  messageArgs?: MessageArgs;
  components?: MessageComponents;
}
const LocalizedText: React.FC<Props> = React.memo((props) => {
  const { messageID, messageArgs, components } = props;
  return (
    <FormattedMessage
      id={messageID}
      values={messageArgs}
      components={components}
    />
  );
});

export default LocalizedText;
