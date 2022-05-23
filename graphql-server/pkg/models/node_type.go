package models

import (
	"fmt"
	"reflect"
)

func GetNodeID(obj interface{}) NodeID {
	switch v := obj.(type) {
	case Test:
		return NodeID{EntityType: "test", ID: v.ID}
	case Block:
		return NodeID{EntityType: "block", ID: v.Hash}
	default:
		panic(fmt.Sprintf(
			`unknown entity type "%s"`,
			reflect.TypeOf(v).String(),
		))
	}

}
