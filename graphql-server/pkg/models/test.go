package models

import "github.com/uptrace/bun"

type Test struct {
	bun.BaseModel `bun:"table:test,alias:t"`

	Base

	String string `bun:"string,notnull"`
	Int    int    `bun:"int,notnull"`
}

func (t Test) IsNode() {}

func (t Test) NodeID() NodeID {
	return GetNodeID(t)
}
