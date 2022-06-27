import React, { useCallback, useEffect } from "react";
import cn from "classnames";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import {
  isRequestStateError,
  isRequestStateLoaded,
  RequestStateType,
} from "../../models/RequestState";
import { Icon, IconType } from "../common/Icons/Icons";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { ReactionType } from "../reactions/ReactionModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useReactionAPI } from "../../api/reactionAPI";
import ProposalHeader from "./ProposalHeader";
import ProposalDescription from "./ProposalDescription";
import { useProposalQuery } from "./ProposalDetailScreenAPI";
import { ProposalData } from "./ProposalData";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();
  const { fetch, requestState } = useProposalQuery();
  const { translate } = useLocale();
  const reactionAPI = useReactionAPI();
  const navigate = useNavigate();

  const onSetReaction = useCallback(
    async (type: ReactionType): Promise<void> => {
      if (!isRequestStateLoaded(requestState) || requestState.data == null)
        return;
      try {
        await reactionAPI.setReaction(requestState.data.id, type);
      } catch (e: unknown) {
        console.error("Error while setting reaction", e);
        toast.error(translate("ProposalDetail.setReaction.failure"));
      }
    },
    [requestState, reactionAPI, translate]
  );

  const onUnsetReaction = useCallback(async (): Promise<void> => {
    if (!isRequestStateLoaded(requestState) || requestState.data == null)
      return;
    try {
      await reactionAPI.unsetReaction(requestState.data.id);
    } catch (e: unknown) {
      console.error("Error while setting reaction", e);
      toast.error(translate("ProposalDetail.setReaction.failure"));
    }
  }, [requestState, reactionAPI, translate]);

  useEffect(() => {
    if (id) {
      fetch(id);
    }
  }, [fetch, id]);

  useEffectOnce(
    () => {
      switch (requestState.type) {
        case RequestStateType.Error:
          toast.error("Failed to fetch proposal.", {
            toastId: "proposal-detail-request-error",
          });
          break;
        case RequestStateType.Loaded:
          if (requestState.data === null) {
            toast.error(`Proposal ${id} does not exist`);
            navigate(AppRoutes.Proposals);
          }
          break;
        default:
          console.error(
            "Unrecognized request state type = ",
            requestState.type
          );
          break;
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  if (!id) return <Navigate to={AppRoutes.Proposals} />;

  if (!isRequestStateLoaded(requestState)) {
    return (
      <div className={cn("flex", "flex-col", "h-full")}>
        {[...Array(4)].map((_, index) => (
          <Paper
            key={index}
            className={cn("flex", "justify-center", "items-center")}
          >
            <Icon
              icon={IconType.Ellipse}
              className={cn("animate-spin")}
              height={24}
              width={24}
            />
          </Paper>
        ))}
      </div>
    );
  }

  if (!requestState.data) return null;

  return (
    <div className={cn("flex", "flex-col")}>
      <ProposalHeader
        proposal={requestState.data}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSetReaction={onSetReaction}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onUnsetReaction={onUnsetReaction}
      />
      <ProposalDescription proposal={requestState.data} />
      <ProposalData proposal={requestState.data} />
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
