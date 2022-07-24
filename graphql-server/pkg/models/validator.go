package models

import (
	"github.com/uptrace/bun"
)

type Validator struct {
	bun.BaseModel `bun:"table:validator"`

	ConsensusAddress string `bun:"column:consensus_address,pk"`
	ConsensusPubKey  string `bun:"column:consensus_pubkey,notnull"`

	Description *ValidatorDescription `bun:"rel:has-one,join:consensus_address=validator_address"`
	Info        *ValidatorInfo        `bun:"rel:has-one,join:consensus_address=consensus_address"`
	Status      *ValidatorStatus      `bun:"rel:has-one,join:consensus_address=validator_address"`
}

func (p Validator) IsNode()              {}
func (p Validator) IsProposalVoter()     {}
func (p Validator) IsProposalDepositor() {}
func (p Validator) NodeID() NodeID {
	return GetNodeID(p)
}

type ValidatorConnection = Connection[Validator]
type ValidatorEdge = Edge[Validator]

type ValidatorDescription struct {
	bun.BaseModel `bun:"table:validator_description"`

	ValidatorAddress string `bun:"column:validator_address,pk"`
	Moniker          string `bun:"column:moniker"`
	Identity         string `bun:"column:identity"`
	AvatarURL        string `bun:"column:avatar_url"`
	Website          string `bun:"column:website"`
	SecurityContact  string `bun:"column:security_contact"`
	Details          string `bun:"column:details"`
	Height           int64  `bun:"column:height,notnull"`

	Validator *Validator `bun:"rel:belongs-to,join:validator_address=consensus_address"`
}

type ValidatorInfo struct {
	bun.BaseModel `bun:"table:validator_info"`

	ConsensusAddress    string `bun:"column:consensus_address,pk"`
	OperatorAddress     string `bun:"column:operator_address,notnull"`
	SelfDelegateAddress string `bun:"column:self_delegate_address"`
	MaxChangeRate       string `bun:"column:max_change_rate,notnull"`
	MaxRate             string `bun:"column:max_rate,notnull"`
	Height              int64  `bun:"column:height,notnull"`

	Validator        *Validator         `bun:"rel:belongs-to,join:consensus_address=consensus_address"`
	ProposalVotes    []*ProposalVote    `bun:"rel:has-many,join:self_delegate_address=voter_address"`
	ProposalDeposits []*ProposalDeposit `bun:"rel:has-many,join:self_delegate_address=depositor_address"`
}

type ValidatorStatus struct {
	bun.BaseModel `bun:"table:validator_status"`

	ConsensusAddress string `bun:"column:validator_address,pk"`
	Status           int    `bun:"column:status,notnull"`
	Jailed           bool   `bun:"column:jailed,notnull"`
	Tombstoned       bool   `bun:"column:tombstoned,notnull"`
	Height           int64  `bun:"column:height,notnull"`
}
