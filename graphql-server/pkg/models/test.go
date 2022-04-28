package models

import "github.com/uptrace/bun"

type Test struct {
	bun.BaseModel `bun:"table:test,alias:t"`

	Base

	String string
	Int    int
}
