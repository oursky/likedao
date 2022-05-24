package models

import (
	bdjuno "github.com/forbole/bdjuno/database/types"
	"github.com/uptrace/bun"
)

type Supply struct {
	bun.BaseModel `bun:"table:supply"`

	Coins  bdjuno.DbDecCoins `bun:"column:coins,notnull"`
	Height int64             `bun:"column:height,notnull"`
}
