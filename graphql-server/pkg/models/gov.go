package models

import (
	"github.com/forbole/bdjuno/database/types"
	"github.com/uptrace/bun"
)

type DepositParams struct {
	MinDeposit       []*types.DbDecCoin `json:"min_deposit"`
	MaxDepositPeriod int64              `json:"max_deposit_period"`
}

type TallyParams struct {
	Quorum        string `json:"quorum"`
	Threshold     string `json:"threshold"`
	VetoThreshold string `json:"veto_threshold"`
}

type VotingParams struct {
	VotingPeriod int64 `json:"voting_period"`
}

type GovParams struct {
	bun.BaseModel `bun:"table:gov_params"`

	DepositParams DepositParams `bun:"column:deposit_params,type:jsonb"`
	TallyParams   TallyParams   `bun:"column:tally_params,type:jsonb"`
	VotingParams  VotingParams  `bun:"column:voting_params,type:jsonb"`
}
