import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import Config from "../../config/Config";
import { translateAddress } from "../../utils/address";

interface ValidatorDetailScreenProps {}

const Bech32PrefixAccAddr = Config.chainInfo.bech32Config.bech32PrefixAccAddr;
const ValidatorDetailScreen: React.FC<ValidatorDetailScreenProps> = ({}) => {
  const { address: operatorAddress } = useParams();

  const selfDelegateAddress = useMemo(
    // eslint-disable-next-line no-confusing-arrow
    () =>
      operatorAddress
        ? translateAddress(operatorAddress, Bech32PrefixAccAddr)
        : null,
    [operatorAddress]
  );

  return (
    <div>
      Validator Detail Screen Page holder for {operatorAddress} (
      {selfDelegateAddress})
    </div>
  );
};

export default ValidatorDetailScreen;
