package models

import (
	"time"

	servererrors "github.com/oursky/likedao/pkg/errors"
	"github.com/uptrace/bun"
)

type ProposalFilter string

const (
	Voting    ProposalFilter = "voting"
	Deposit                  = "deposit"
	Passed                   = "passed"
	Rejected                 = "rejected"
	Following                = "following"
)

func (f ProposalFilter) String() string {
	return string(f)
}

func ParseProposalFilter(s string) (ProposalFilter, error) {
	switch s {
	case "voting":
		return Voting, nil
	case "deposit":
		return Deposit, nil
	case "passed":
		return Passed, nil
	case "rejected":
		return Rejected, nil
	case "following":
		return Following, nil
	default:
		return "", servererrors.Wrapf(servererrors.ErrValidationFailure, "invalid proposal filter: %s", s)
	}
}

type QueryProposalsInput struct {
	Before           string
	SearchTerm       string
	Filter           ProposalFilter
	FollowingAddress string
}

type Proposal struct {
	bun.BaseModel `bun:"table:proposal"`

	ID              int               `bun:"column:id,pk"`
	Title           string            `bun:"column:title,notnull"`
	Description     string            `bun:"column:description,notnull"`
	Content         map[string]string `bun:"type:jsonb column:content,notnull"`
	ProposalRoute   string            `bun:"column:proposal_route,notnull"`
	ProposalType    string            `bun:"column:proposal_type,notnull"`
	SubmitTime      time.Time         `bun:"column:submit_time,notnull"`
	DepositEndTime  time.Time         `bun:"column:deposit_end_time,notnull"`
	VotingStartTime time.Time         `bun:"column:voting_start_time,notnull"`
	VotingEndTime   time.Time         `bun:"column:voting_end_time,notnull"`
	ProposerAddress string            `bun:"column:proposer_address,notnull"`
	Status          string            `bun:"column:status,notnull"`
}

func (p Proposal) IsNode() {}
func (p Proposal) NodeID() NodeID {
	return GetNodeID(p)
}

type ProposalConnection = Connection[Proposal]
type ProposalEdge = Edge[Proposal]
