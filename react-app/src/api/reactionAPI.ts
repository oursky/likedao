import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ApolloCache,
  DefaultContext,
  MutationUpdaterFunction,
} from "@apollo/client";
import { useGraphQLMutation } from "../hooks/graphql";
import {
  ReactionApiSetReactionMutationMutation,
  ReactionApiSetReactionMutationMutationVariables,
  ReactionApiSetReactionMutation,
  ReactionApiUnsetReactionMutation,
  ReactionApiUnsetReactionMutationMutation,
  ReactionApiUnsetReactionMutationMutationVariables,
  ReactionCount,
} from "../generated/graphql";
import { ReactionType } from "../components/reactions/ReactionModel";

export enum ReactionTargetType {
  Proposal = "Proposal",
}

interface IReactionAPI {
  setReaction(
    targetType: ReactionTargetType,
    targetId: string,
    reaction: ReactionType
  ): Promise<ReactionApiUnsetReactionMutationMutation>;
  unsetReaction(
    targetType: ReactionTargetType,
    targetId: string
  ): Promise<ReactionApiUnsetReactionMutationMutation>;
}

// Typeoverloaded function to handle both set and unset reactions
function _createReactionOptimisticResponse(
  reactionType: ReactionType
): ReactionApiSetReactionMutationMutation;
function _createReactionOptimisticResponse(
  reactionType: null
): ReactionApiUnsetReactionMutationMutation;
function _createReactionOptimisticResponse(
  reactionType: ReactionType | null
):
  | ReactionApiSetReactionMutationMutation
  | ReactionApiUnsetReactionMutationMutation {
  if (reactionType == null) {
    return {
      __typename: "Mutation",
      unsetReaction: {
        __typename: "Reaction",
        id: uuidv4(),
      },
    };
  }

  return {
    __typename: "Mutation",
    setReaction: {
      __typename: "Reaction",
      id: uuidv4(),
      reaction: reactionType,
      address: "",
    },
  };
}

function isSetReactionMutationData(
  data?:
    | ReactionApiSetReactionMutationMutation
    | ReactionApiUnsetReactionMutationMutation
    | null
): data is ReactionApiSetReactionMutationMutation {
  if (!data) {
    return false;
  }
  return "setReaction" in data;
}

function _buildReactionMutationUpdater(
  targetType: ReactionTargetType,
  targetId: string
): MutationUpdaterFunction<
  | ReactionApiSetReactionMutationMutation
  | ReactionApiUnsetReactionMutationMutation,
  | ReactionApiSetReactionMutationMutationVariables
  | ReactionApiUnsetReactionMutationMutationVariables,
  DefaultContext,
  ApolloCache<any>
> {
  switch (targetType) {
    case ReactionTargetType.Proposal:
      return (cache, { data }) => {
        const reaction = isSetReactionMutationData(data)
          ? data.setReaction.reaction
          : null;

        const cacheId = `Proposal:{"id":"${targetId}"}`;
        cache.modify({
          id: cacheId,
          fields: {
            myReaction() {
              return reaction;
            },
            reactions(
              reactionCounts: ReactionCount[],
              { readField, toReference }
            ) {
              const myReaction = readField("myReaction", toReference(cacheId));

              const mutableReactionCounts = [...reactionCounts];

              // Add new reaction if not exists
              const isNewReaction =
                reaction !== null &&
                !reactionCounts.find((r) => reaction === r.reaction);
              if (isNewReaction) {
                mutableReactionCounts.push({ reaction, count: 0 });
              }

              // Calculate reaction count
              return (
                mutableReactionCounts
                  .map((r) => {
                    // Add 1 count if reaction is our target reaction
                    if (reaction === r.reaction) {
                      return {
                        ...r,
                        count: r.count + 1,
                      };
                    }

                    // If myReaction exists, remove 1 from existing reaction
                    if (myReaction === r.reaction) {
                      return {
                        ...r,
                        count: r.count - 1,
                      };
                    }

                    return r;
                  })
                  // Filter out empty reactions
                  .filter((r) => r.count !== 0)
              );
            },
          },
        });
      };
    default:
      throw new Error(`Unknown reaction target type`);
  }
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
    async (
      targetType: ReactionTargetType,
      targetId: string,
      reaction: ReactionType
    ) => {
      return setReactionMutationFunction({
        variables: {
          input: {
            targetId,
            reaction,
          },
        },
        // Optimistic response to trigger update function
        optimisticResponse: _createReactionOptimisticResponse(reaction),
        update: _buildReactionMutationUpdater(targetType, targetId),
      });
    },
    [setReactionMutationFunction]
  );

  const unsetReaction = useCallback(
    async (targetType: ReactionTargetType, targetId: string) => {
      return unsetReactionMutationFunction({
        variables: {
          input: {
            targetId,
          },
        },
        // Optimistic response to trigger update function
        optimisticResponse: _createReactionOptimisticResponse(null),
        update: _buildReactionMutationUpdater(targetType, targetId),
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
