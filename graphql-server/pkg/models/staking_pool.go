package models

import (
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/extra/bunbig"
)

type StakingPool struct {
	bun.BaseModel `bun:"table:staking_pool"`

	BondedTokens    *bunbig.Int `bun:"column:bonded_tokens,notnull"`
	NotBondedTokens *bunbig.Int `bun:"column:not_bonded_tokens,notnull"`
	Height          int64       `bun:"column:height,notnull"`
}
