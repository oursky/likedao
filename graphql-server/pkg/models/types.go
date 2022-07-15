package models

import (
	"encoding/json"
	"fmt"
	"io"
	"strconv"

	"github.com/pkg/errors"
	"github.com/uptrace/bun/extra/bunbig"
)

type BigInt string
type BigFloat string

func NewBigIntFromBunBigInt(b *bunbig.Int) BigInt {
	return BigInt(b.String())
}

func NewBigInt(d int) BigInt {
	return BigInt(strconv.Itoa(d))
}

func (b BigInt) MarshalGQL(w io.Writer) {
	if err := json.NewEncoder(w).Encode(b); err != nil {
		panic(errors.Wrapf(err, "error marshaling BigInt %[1]v", b))
	}
}

func (b *BigInt) UnmarshalGQL(v interface{}) error {
	check, ok := v.(string)
	if !ok {
		return errors.New("BigInt must be a valid string value")
	}

	*b = BigInt(check)

	return nil
}

func NewBigFloatFromBunBigFloat(b *bunbig.Float) BigFloat {
	return BigFloat(b.String())
}

func NewBigFloat(f float64) BigFloat {
	return BigFloat(fmt.Sprintf("%f", f))
}

func (b BigFloat) MarshalGQL(w io.Writer) {
	if err := json.NewEncoder(w).Encode(b); err != nil {
		panic(errors.Wrapf(err, "error marshaling BigFloat %[1]v", b))
	}
}

func (b *BigFloat) UnmarshalGQL(v interface{}) error {
	check, ok := v.(string)
	if !ok {
		return errors.New("BigFloat must be a valid string value")
	}

	*b = BigFloat(check)

	return nil
}
