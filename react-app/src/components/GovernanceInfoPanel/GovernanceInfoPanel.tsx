import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import { GovParams, useGovAPI } from "../../api/govAPI";
import { useLocale } from "../../providers/AppLocaleProvider";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";

const GovernanceInfoPanel: React.FC = () => {
  const govAPI = useGovAPI();
  const { translate } = useLocale();

  const [govParams, setGovParams] = useState<GovParams | null>(null);

  const fetchGovParams = useCallback(async () => {
    try {
      const params = await govAPI.getAllParams();
      setGovParams(params);
    } catch {
      toast.error(translate("GovernanceInfoPanel.error"));
    }
  }, [govAPI, translate]);

  useEffect(() => {
    // Error handled inside `fetchGovParams()`
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchGovParams();
  }, [fetchGovParams]);

  if (!govParams) {
    return (
      <Paper>
        <LoadingSpinner />
      </Paper>
    );
  }

  return (
    <Paper className={cn("")}>
      <pre>{JSON.stringify(govParams, null, 4)}</pre>
    </Paper>
  );
};

export default GovernanceInfoPanel;
