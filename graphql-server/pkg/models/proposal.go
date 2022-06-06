package models

import (
	"time"

	servererrors "github.com/oursky/likedao/pkg/errors"
	"github.com/uptrace/bun"
)

type ProposalStatus string

const (
	ProposalStatusUnspecified   ProposalStatus = "PROPOSAL_STATUS_UNSPECIFIED"
	ProposalStatusDepositPeriod ProposalStatus = "PROPOSAL_STATUS_DEPOSIT_PERIOD"
	ProposalStatusVotingPeriod  ProposalStatus = "PROPOSAL_STATUS_VOTING_PERIOD"
	ProposalStatusPassed        ProposalStatus = "PROPOSAL_STATUS_PASSED"
	ProposalStatusRejected      ProposalStatus = "PROPOSAL_STATUS_REJECTED"
	ProposalStatusFailed        ProposalStatus = "PROPOSAL_STATUS_FAILED"
	ProposalStatusInvalid       ProposalStatus = "PROPOSAL_STATUS_INVALID"
)

func (e ProposalStatus) IsValid() bool {
	switch e {
	case ProposalStatusDepositPeriod, ProposalStatusVotingPeriod, ProposalStatusPassed, ProposalStatusRejected, ProposalStatusFailed, ProposalStatusInvalid:
		return true
	}
	return false
}
func (e *ProposalStatus) UnmarshalGQL(v string) error {
	*e = ProposalStatus(v)
	if !e.IsValid() {
		return servererrors.Wrapf(servererrors.ErrValidationFailure, "invalid proposal status: %s", v)
	}
	return nil
}

func (e ProposalFilter) ToProposalStatus() ProposalStatus {
	switch e {
	case ProposalFilterVoting:
		return ProposalStatusVotingPeriod
	case ProposalFilterDeposit:
		return ProposalStatusDepositPeriod
	case ProposalFilterPassed:
		return ProposalStatusPassed
	case ProposalFilterRejected:
		return ProposalStatusRejected
	default:
		return ProposalStatusUnspecified
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

	// Skipping content field because already parsed by bdjuno
	ID              int            `bun:"column:id,pk"`
	Title           string         `bun:"column:title,notnull"`
	Description     string         `bun:"column:description,notnull"`
	ProposalRoute   string         `bun:"column:proposal_route,notnull"`
	ProposalType    string         `bun:"column:proposal_type,notnull"`
	SubmitTime      time.Time      `bun:"column:submit_time,notnull"`
	DepositEndTime  time.Time      `bun:"column:deposit_end_time"`
	VotingStartTime time.Time      `bun:"column:voting_start_time"`
	VotingEndTime   time.Time      `bun:"column:voting_end_time"`
	ProposerAddress string         `bun:"column:proposer_address,notnull"`
	Status          ProposalStatus `bun:"column:status,notnull"`
}

func (p Proposal) IsNode() {}
func (p Proposal) NodeID() NodeID {
	return GetNodeID(p)
}

type ProposalConnection = Connection[Proposal]
type ProposalEdge = Edge[Proposal]
