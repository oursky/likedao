package models

import (
	"fmt"
	"reflect"
	"strconv"
)

func GetNodeID(obj interface{}) NodeID {
	switch v := obj.(type) {
	case Test:
		return NodeID{EntityType: "test", ID: v.ID}
	case Block:
		return NodeID{EntityType: "block", ID: v.Hash}
	case Proposal:
		return NodeID{EntityType: "proposal", ID: strconv.Itoa(v.ID)}
	case Reaction:
		return NodeID{EntityType: "reaction", ID: v.ID}
	case ProposalVote:
		return NodeID{EntityType: "proposalVote", ID: v.ID().String()}
	case Validator:
		return NodeID{EntityType: "validator", ID: v.ConsensusAddress}
	default:
		panic(fmt.Sprintf(
			`unknown entity type "%s"`,
			reflect.TypeOf(v).String(),
		))
	}

}
