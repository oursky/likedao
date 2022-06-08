import { useState, useCallback } from "react";

const useShare = (
  data?: ShareData
): { canShare: boolean; share: () => void; error: any } => {
  const [error, setError] = useState();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const canShare = Boolean(navigator.canShare) && navigator.canShare(data);

  const share = useCallback(() => {
    navigator.share(data).catch((err) => {
      setError(err);
      console.error("Error sharing = ", err);
    });
  }, [data]);

  return { canShare, share, error };
};

export default useShare;
