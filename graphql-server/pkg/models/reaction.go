package models

import (
	"fmt"

	"github.com/uptrace/bun"
)

type ReactionTargetType string

const (
	ReactionTargetTypeProposal ReactionTargetType = "proposal"
	ReactionTargetTypeComment  ReactionTargetType = "comment"
	ReactionTargetTypePost     ReactionTargetType = "post"
)

func (e ReactionTargetType) IsValid() bool {
	switch e {
	case ReactionTargetTypeProposal, ReactionTargetTypeComment, ReactionTargetTypePost:
		return true
	}
	return false
}

func (e *ReactionTargetType) UnmarshalGQL(v string) error {
	*e = ReactionTargetType(v)
	if !e.IsValid() {
		return fmt.Errorf("invalid ReactionTargetType: %s", v)
	}
	return nil
}

type Reaction struct {
	bun.BaseModel `bun:"table:reaction"`

	Base

	Reaction   string             `bun:"reaction,notnull"`
	Address    string             `bun:"address,notnull"`
	TargetID   string             `bun:"target_id,notnull"`
	TargetType ReactionTargetType `bun:"target_type,notnull"`
}

func (r Reaction) IsNode() {}

func (r Reaction) NodeID() NodeID {
	return GetNodeID(r)
}
