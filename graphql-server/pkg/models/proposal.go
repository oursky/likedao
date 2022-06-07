package models

import (
	"time"

	bdjuno "github.com/forbole/bdjuno/database/types"
	servererrors "github.com/oursky/likedao/pkg/errors"
	"github.com/uptrace/bun/extra/bunbig"
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

type ProposalDeposit struct {
	bun.BaseModel `bun:"table:proposal_deposit"`

	ProposalID       int               `bun:"column:proposal_id,pk"`
	DepositorAddress string            `bun:"column:depositor_address,notnull"`
	Amount           bdjuno.DbDecCoins `bun:"column:amount,notnull"`
	Height           int64             `bun:"column:height,notnull"`
}

type ProposalVote struct {
	bun.BaseModel `bun:"table:proposal_vote"`

	ProposalID   int    `bun:"column:proposal_id,pk"`
	VoterAddress string `bun:"column:voter_address,notnull"`
	Option       string `bun:"column:option,notnull"`
	Height       int64  `bun:"column:height,notnull"`
}

type ProposalTallyResult struct {
	bun.BaseModel `bun:"table:proposal_tally_result"`

	ProposalID int `bun:"column:proposal_id,pk"`
	Yes        *bunbig.Int `bun:"column:yes,notnull"`
	No         *bunbig.Int `bun:"column:no,notnull"`
	Abstain    *bunbig.Int `bun:"column:abstain,notnull"`
	NoWithVeto *bunbig.Int `bun:"column:no_with_veto,notnull"`
	Height    int64 `bun:"column:height,notnull"`
}
