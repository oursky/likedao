const useShare = (): {
  canShare: boolean;
  share: (data?: ShareData) => Promise<void>;
} => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const canShare = Boolean(navigator.canShare);

  const share = canShare
    ? navigator.share.bind(navigator)
    : async () => Promise.resolve();

  return { canShare, share };
};

export default useShare;
