package models

import (
	"github.com/uptrace/bun"
)

type AverageBlockTime struct {
	bun.BaseModel `bun:"table:average_block_time_per_hour"`

	AverageTime float64 `bun:"average_time,notnull"`
	Height      int     `bun:"height,notnull"`
}
