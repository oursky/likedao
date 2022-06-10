package models

import (
	"fmt"
	"strings"
	"time"
)

const Delimitor = "|"

type ExpirableValue struct {
	Value      string
	ExpiryTime time.Time
}

func (m *ExpirableValue) Encode() string {
	expiryTimeString := m.ExpiryTime.Format(time.RFC3339)

	return fmt.Sprintf("%s%s%s", m.Value, Delimitor, expiryTimeString)
}

func (m *ExpirableValue) ParseString(str string) error {
	splittedString := strings.Split(str, Delimitor)
	if len(splittedString) != 2 {
		return fmt.Errorf("invalid value: %s", str)
	}

	m.Value = splittedString[0]

	expiryTime, err := time.Parse(time.RFC3339, splittedString[1])
	if err != nil {
		return err
	}

	m.ExpiryTime = expiryTime
	return nil
}

func (m *ExpirableValue) IsExpired() bool {
	return m.ExpiryTime.Before(time.Now())
}
