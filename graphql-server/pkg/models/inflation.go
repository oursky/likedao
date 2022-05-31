package models

import (
	"github.com/uptrace/bun"
)

type Inflation struct {
	bun.BaseModel `bun:"table:inflation"`

	Value  float64 `bun:"column:value,notnull"`
	Height int64   `bun:"column:height,notnull"`
}
