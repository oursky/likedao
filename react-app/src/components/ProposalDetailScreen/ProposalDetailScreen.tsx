import React, { useEffect } from "react";
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
import ProposalHeader from "./ProposalHeader";
import ProposalDescription from "./ProposalDescription";
import { useProposalQuery } from "./ProposalDetailScreenAPI";
import { ProposalData } from "./ProposalData";

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();
  const { fetch, requestState } = useProposalQuery();
  const navigate = useNavigate();

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
      <ProposalHeader proposal={requestState.data} />
      <ProposalDescription proposal={requestState.data} />
      <ProposalData proposal={requestState.data} />
      <Paper>Comments Placeholder</Paper>
    </div>
  );
};

export default ProposalDetailScreen;
