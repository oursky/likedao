package errors

import (
	"errors"
	"fmt"
)

var (
	ErrInternalError     = errors.New("Internal error")
	ErrInvalidNodeID     = errors.New("Invalid node ID")
	ErrValidationFailure = errors.New("Failed to validate values")
	ErrNotFound          = errors.New("Not found")
	ErrInvalidCursor     = errors.New("Invalid cursor")
	ErrUnauthenticated   = errors.New("Unauthenticated")
)

type ServerError struct {
	parent  error
	message string
}

type Causer interface {
	Cause() error
}

func (e *ServerError) Error() string {
	return fmt.Sprintf("%s: %s", e.message, e.parent.Error())
}

func (e *ServerError) Cause() error {
	return e.parent
}

func (e *ServerError) Is(target error) bool {
	if e == target {
		return true
	}

	w := e.Cause()
	for {
		if w == target {
			return true
		}

		x, ok := w.(Causer)
		if ok {
			w = x.Cause()
		}
		if x == nil {
			return false
		}
	}
}

func (e *ServerError) Unwrap() error {
	return e.parent
}

func Wrap(err error, description string) error {
	if err == nil {
		return nil
	}

	return &ServerError{
		parent:  err,
		message: description,
	}
}

func Wrapf(err error, format string, args ...interface{}) error {
	desc := fmt.Sprintf(format, args...)
	return Wrap(err, desc)
}
