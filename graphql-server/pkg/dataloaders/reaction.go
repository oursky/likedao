package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type ReactionDataloader interface {
	LoadProposalReactionCount(id int) ([]models.DBReactionCount, error)
	LoadUserProposalReactions(key UserProposalReactionKey) (*models.Reaction, error)
}

type ProposalReactionCountDataloader interface {
	Load(id int) ([]models.DBReactionCount, error)
	LoadAll(ids []int) ([][]models.DBReactionCount, []error)
}

type UserProposalReactionKey struct {
	ProposalID  int
	UserAddress string
}

type UserProposalReactionDataloader interface {
	Load(key UserProposalReactionKey) (*models.Reaction, error)
	LoadAll(keys []UserProposalReactionKey) ([]*models.Reaction, []error)
}

type IReactionDataloader struct {
	proposalReactionCountLoader ProposalReactionCountDataloader
	userProposalReactionLoader  UserProposalReactionDataloader
}

func NewReactionDataloader(reactionQuery queries.IReactionQuery) ReactionDataloader {
	proposalReactionCountLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[int, []models.DBReactionCount]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(ids []int) ([][]models.DBReactionCount, []error) {
			reactionCounts, err := reactionQuery.ScopeProposals(ids).QueryTargetReactions()
			if err != nil {
				errors := make([]error, 0, len(ids))
				for range ids {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return reactionCounts, nil
		},
	})

	userProposalReactionLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[UserProposalReactionKey, *models.Reaction]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(keys []UserProposalReactionKey) ([]*models.Reaction, []error) {

			userToProposalIDs := make(map[string][]int)
			for _, key := range keys {
				if _, ok := userToProposalIDs[key.UserAddress]; !ok {
					userToProposalIDs[key.UserAddress] = []int{}
				}
				userToProposalIDs[key.UserAddress] = append(userToProposalIDs[key.UserAddress], key.ProposalID)
			}

			keyToReaction := make(map[UserProposalReactionKey]*models.Reaction)
			keyToErrors := make(map[UserProposalReactionKey]error)
			for user, proposalIDs := range userToProposalIDs {
				userProposalReactions, err := reactionQuery.ScopeProposals(proposalIDs).ScopeUserAddress(user).QueryUserReactions()

				for i, proposalID := range proposalIDs {
					key := UserProposalReactionKey{
						ProposalID:  proposalID,
						UserAddress: user,
					}
					keyToReaction[key] = userProposalReactions[i]
					keyToErrors[key] = err
				}
			}

			result := make([]*models.Reaction, 0, len(keys))
			errors := make([]error, 0, len(keys))
			for _, key := range keys {
				result = append(result, keyToReaction[key])
				errors = append(errors, keyToErrors[key])
			}

			return result, nil

		},
	})

	return &IReactionDataloader{
		proposalReactionCountLoader: proposalReactionCountLoader,
		userProposalReactionLoader:  userProposalReactionLoader,
	}
}

func (d *IReactionDataloader) LoadProposalReactionCount(id int) ([]models.DBReactionCount, error) {
	return d.proposalReactionCountLoader.Load(id)
}

func (d *IReactionDataloader) LoadUserProposalReactions(key UserProposalReactionKey) (*models.Reaction, error) {
	return d.userProposalReactionLoader.Load(key)
}
