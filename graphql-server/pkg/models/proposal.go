package models

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	bdjuno "github.com/forbole/bdjuno/database/types"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/extra/bunbig"
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
		return fmt.Errorf("invalid ProposalStatus: %s", v)
	}
	return nil
}

func (e ProposalStatusFilter) ToProposalStatus() ProposalStatus {
	switch e {
	case ProposalStatusFilterVoting:
		return ProposalStatusVotingPeriod
	case ProposalStatusFilterDeposit:
		return ProposalStatusDepositPeriod
	case ProposalStatusFilterPassed:
		return ProposalStatusPassed
	case ProposalStatusFilterRejected:
		return ProposalStatusRejected
	default:
		return ProposalStatusUnspecified
	}
}

type ProposalVoteOption string

const (
	ProposalVoteOptionYes        ProposalVoteOption = "VOTE_OPTION_YES"
	ProposalVoteOptionNo         ProposalVoteOption = "VOTE_OPTION_NO"
	ProposalVoteOptionAbstain    ProposalVoteOption = "VOTE_OPTION_ABSTAIN"
	ProposalVoteOptionNoWithVeto ProposalVoteOption = "VOTE_OPTION_NO_WITH_VETO"
)

func (e ProposalVoteOption) IsValid() bool {
	switch e {
	case ProposalVoteOptionYes, ProposalVoteOptionNo, ProposalVoteOptionAbstain, ProposalVoteOptionNoWithVeto:
		return true
	}
	return false
}

func (e *ProposalVoteOption) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = ProposalVoteOption(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid ProposalVoteOption", str)
	}
	return nil
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

	ProposalID       int                `bun:"column:proposal_id,pk"`
	DepositorAddress string             `bun:"column:depositor_address,notnull"`
	Amount           []bdjuno.DbDecCoin `bun:"column:amount,notnull,array"`
	Height           int64              `bun:"column:height,notnull"`

	Proposal      *Proposal      `bun:"rel:belongs-to,join:proposal_id=id"`
	ValidatorInfo *ValidatorInfo `bun:"rel:has-one,join:depositor_address=self_delegate_address"`
}

func (p ProposalDeposit) ID() ProposalDepositID {
	return ProposalDepositID{
		ProposalID: p.ProposalID,
		Depositor:  p.DepositorAddress,
	}
}

type ProposalDepositID struct {
	ProposalID int
	Depositor  string
}

func (proposalDepositID ProposalDepositID) String() string {
	if proposalDepositID.Depositor == "" {
		return strconv.Itoa(proposalDepositID.ProposalID)
	}
	return fmt.Sprintf("%d-%s", proposalDepositID.ProposalID, proposalDepositID.Depositor)
}

func ParseProposalDepositID(proposalDepositID string) (ProposalDepositID, error) {
	parts := strings.Split(proposalDepositID, "-")
	if len(parts) != 2 {
		return ProposalDepositID{}, fmt.Errorf("invalid proposal vote ID: %s", proposalDepositID)
	}

	proposalID, err := strconv.Atoi(parts[0])
	if err != nil {
		return ProposalDepositID{}, fmt.Errorf("failed to parse proposal ID: %s", proposalDepositID)
	}

	return ProposalDepositID{
		ProposalID: proposalID,
		Depositor:  parts[1],
	}, nil
}

func (p ProposalDeposit) IsNode() {}
func (p ProposalDeposit) NodeID() NodeID {
	return GetNodeID(p)
}

type ProposalDepositConnection = Connection[ProposalDeposit]
type ProposalDepositEdge = Edge[ProposalDeposit]

type ProposalVote struct {
	bun.BaseModel `bun:"table:proposal_vote"`

	ProposalID   int                `bun:"column:proposal_id,pk"`
	VoterAddress string             `bun:"column:voter_address,notnull"`
	Option       ProposalVoteOption `bun:"column:option,notnull"`
	Height       int64              `bun:"column:height,notnull"`

	ValidatorInfo *ValidatorInfo `bun:"rel:has-one,join:voter_address=self_delegate_address"`
}

func (p ProposalVote) ID() ProposalVoteID {
	return ProposalVoteID{
		ProposalID: p.ProposalID,
		Voter:      p.VoterAddress,
	}
}

type ProposalVoteID struct {
	ProposalID int
	Voter      string
}

func (proposalVoteID ProposalVoteID) String() string {
	return fmt.Sprintf("%d-%s", proposalVoteID.ProposalID, proposalVoteID.Voter)
}

func ParseProposalVoteID(proposalVoteID string) (ProposalVoteID, error) {
	parts := strings.Split(proposalVoteID, "-")
	if len(parts) != 2 {
		return ProposalVoteID{}, fmt.Errorf("invalid proposal vote ID: %s", proposalVoteID)
	}

	proposalID, err := strconv.Atoi(parts[0])
	if err != nil {
		return ProposalVoteID{}, fmt.Errorf("failed to parse proposal ID: %s", proposalVoteID)
	}

	return ProposalVoteID{
		ProposalID: proposalID,
		Voter:      parts[1],
	}, nil
}

func (p ProposalVote) IsNode() {}
func (p ProposalVote) NodeID() NodeID {
	return GetNodeID(p)
}

type ProposalVoteConnection = Connection[ProposalVote]
type ProposalVoteEdge = Edge[ProposalVote]

type ProposalVoteOptionCount struct {
	Option ProposalVoteOption
	Count  *bunbig.Int
}

type ProposalTallyResult struct {
	bun.BaseModel `bun:"table:proposal_tally_result"`

	ProposalID int         `bun:"column:proposal_id,pk"`
	Yes        *bunbig.Int `bun:"column:yes,notnull"`
	No         *bunbig.Int `bun:"column:no,notnull"`
	Abstain    *bunbig.Int `bun:"column:abstain,notnull"`
	NoWithVeto *bunbig.Int `bun:"column:no_with_veto,notnull"`
	Height     int64       `bun:"column:height,notnull"`
}

type ProposalStakingPool struct {
	bun.BaseModel `bun:"table:proposal_staking_pool_snapshot"`

	ProposalID      int         `bun:"column:proposal_id,pk"`
	BondedTokens    *bunbig.Int `bun:"column:bonded_tokens"`
	NotBondedTokens *bunbig.Int `bun:"column:not_bonded_tokens"`
	Height          int64       `bun:"column:height"`
}
