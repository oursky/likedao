import { useCallback } from "react";

const useShare = (): {
  canShare: boolean;
  share: (data: ShareData) => Promise<void>;
} => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const canShare = Boolean(navigator.canShare);

  const share = useCallback(async (data: ShareData) => {
    if (!navigator.canShare(data)) return;

    await navigator.share(data);
  }, []);

  return { canShare, share };
};

export default useShare;
