import { useCallback, useMemo } from "react";
import { StdSignature, StdSignDoc } from "@cosmjs/amino";
import Config from "../config/Config";

interface IAuthAPI {
  getNonce(): Promise<string>;
  verify: (signDoc: StdSignDoc, signature: StdSignature) => Promise<void>;
}

export const useAuthAPI = (): IAuthAPI => {
  const endPoint = Config.authEndpoint;

  const getNonce = useCallback(async (): Promise<string> => {
    const res = await fetch(`${endPoint}/nonce`, {
      credentials: "include",
    });

    return res.text();
  }, [endPoint]);

  const verify = useCallback(
    async (signDoc: StdSignDoc, signature: StdSignature) => {
      await fetch(`${endPoint}/verify`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          sign_doc: signDoc,
          signature,
        }),
      });
    },
    [endPoint]
  );

  return useMemo(
    () => ({
      getNonce,
      verify,
    }),
    [getNonce, verify]
  );
};
