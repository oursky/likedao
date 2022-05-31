package models

import (
	bdjuno "github.com/forbole/bdjuno/database/types"
	"github.com/uptrace/bun"
)

type CommunityPool struct {
	bun.BaseModel `bun:"table:community_pool"`

	Coins  bdjuno.DbDecCoins `bun:"column:coins,notnull"`
	Height int64             `bun:"column:height,notnull"`
}
