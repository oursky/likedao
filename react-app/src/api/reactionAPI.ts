import { useCallback, useMemo } from "react";
import { useGraphQLMutation } from "../hooks/graphql";
import {
  ReactionApiSetReactionMutationMutation,
  ReactionApiSetReactionMutationMutationVariables,
  ReactionApiSetReactionMutation,
  ReactionApiUnsetReactionMutation,
  ReactionApiUnsetReactionMutationMutation,
  ReactionApiUnsetReactionMutationMutationVariables,
} from "../generated/graphql";
import { ReactionType } from "../components/reactions/ReactionModel";

interface IReactionAPI {
  setReaction(
    targetId: string,
    reaction: ReactionType
  ): Promise<ReactionApiUnsetReactionMutationMutation>;
  unsetReaction(
    targetId: string
  ): Promise<ReactionApiUnsetReactionMutationMutation>;
}

export const useReactionAPI = (): IReactionAPI => {
  const setReactionMutationFunction = useGraphQLMutation<
    ReactionApiSetReactionMutationMutation,
    ReactionApiSetReactionMutationMutationVariables
  >(ReactionApiSetReactionMutation);

  const unsetReactionMutationFunction = useGraphQLMutation<
    ReactionApiUnsetReactionMutationMutation,
    ReactionApiUnsetReactionMutationMutationVariables
  >(ReactionApiUnsetReactionMutation);

  const setReaction = useCallback(
    async (targetId: string, reaction: ReactionType) => {
      return setReactionMutationFunction({
        variables: {
          input: {
            targetId,
            reaction,
          },
        },
      });
    },
    [setReactionMutationFunction]
  );

  const unsetReaction = useCallback(
    async (targetId: string) => {
      return unsetReactionMutationFunction({
        variables: {
          input: {
            targetId,
          },
        },
      });
    },
    [unsetReactionMutationFunction]
  );

  return useMemo(
    () => ({
      setReaction,
      unsetReaction,
    }),
    [setReaction, unsetReaction]
  );
};
