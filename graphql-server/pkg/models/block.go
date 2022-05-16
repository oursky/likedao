package models

import (
	"time"

	"github.com/uptrace/bun"
)

type Block struct {
	bun.BaseModel `bun:"table:block"`

	Height          int       `bun:"height,notnull"`
	Hash            string    `bun:"hash,notnull"`
	NumOfTxs        int       `bun:"num_txs,notnull"`
	TotalGas        int       `bun:"total_gas,notnull"`
	ProposerAddress string    `bun:"proposer_address,notnull"`
	Timestamp       time.Time `bun:"timestamp,notnull"`
}
