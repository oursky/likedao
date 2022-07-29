import React from "react";
import LocalizedText from "../Localized/LocalizedText";

interface TransactionErrorProps {
  error: unknown;
}

const TransactionError: React.FC<TransactionErrorProps> = (props) => {
  const { error } = props;
  return (
    <span>
      <b>
        <LocalizedText messageID="transaction.failure" />
      </b>
      <br />
      <LocalizedText
        messageID="transaction.failure.systemLog"
        messageArgs={{
          error: error instanceof Error ? error.message : "Unknown Error",
        }}
      />
    </span>
  );
};

export default TransactionError;
