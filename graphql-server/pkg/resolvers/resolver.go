package resolvers

import "github.com/uptrace/bun"

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	ServerDB *bun.DB
	ChainDB  *bun.DB
}
