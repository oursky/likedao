package models

import (
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	abnfparser "github.com/fkgi/abnf"
	"github.com/oursky/likedao/pkg/abnf"
	"github.com/tendermint/tendermint/crypto"
	"github.com/tendermint/tendermint/crypto/ed25519"
	"github.com/tendermint/tendermint/crypto/secp256k1"
	"github.com/tendermint/tendermint/crypto/sr25519"
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

type Fee struct {
	Amount []string `json:"amount"`
	Gas    string   `json:"gas"`
}

type MessageSignData struct {
	Data   string `json:"data"` // Base64
	Signer string `json:"signer"`
}

type Message struct {
	Type  string          `json:"type"`
	Value MessageSignData `json:"value"`
}
type PubKey struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

func (p *PubKey) ToPubKey() (crypto.PubKey, error) {
	decodedPubKey, err := base64.StdEncoding.DecodeString(p.Value)
	if err != nil {
		return nil, err
	}

	switch p.Type {
	case secp256k1.PubKeyName:
		pubKey := secp256k1.PubKey(decodedPubKey)
		return &pubKey, nil
	case ed25519.PubKeyName:
		pubKey := ed25519.PubKey(decodedPubKey)
		return &pubKey, nil
	case sr25519.PubKeyName:
		pubKey := sr25519.PubKey(decodedPubKey)
		return &pubKey, nil
	}
	return nil, fmt.Errorf("unknown pubkey type: %s", p.Type)
}

type SignDoc struct {
	AccountNumber string    `json:"account_number"`
	ChainID       string    `json:"chain_id"`
	Fee           Fee       `json:"fee"`
	Memo          string    `json:"memo"`
	Messages      []Message `json:"msgs"`
	Sequence      string    `json:"sequence"`
}
type Signature struct {
	PubKey    PubKey `json:"pub_key"`
	Signature string `json:"signature"`
}

type AuthenticationRequestData struct {
	SignDoc   SignDoc   `json:"sign_doc"`
	Signature Signature `json:"signature"`
}

type AuthenticationMessage struct {
	Authority    string    `json:"authority"`
	Address      string    `json:"address"`
	Statement    string    `json:"statement"`
	URI          string    `json:"uri"`
	ChainID      string    `json:"chain_id"`
	Nonce        string    `json:"nonce"`
	IssuedAt     time.Time `json:"issued_at"`
	ExpirationAt time.Time `json:"expiration_at"`
	NotBefore    time.Time `json:"not_before"`
	RequestID    string    `json:"request_id"`
	Resources    []string  `json:"resources"`
}

func (m *AuthenticationMessage) ParseAbnf(message string) error {
	tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

	if tree == nil {
		return fmt.Errorf("failed to parse abnf")
	}

	m.Authority = string(tree.Child(abnf.AuthorityFQDN).V)
	m.Address = string(tree.Child(abnf.AddressFQDN).V)
	m.Statement = string(tree.Child(abnf.StatementFQDN).V)
	m.URI = string(tree.Child(abnf.URIFQDN).V)
	m.ChainID = string(tree.Child(abnf.ChainIDFQDN).V)
	m.Nonce = string(tree.Child(abnf.NonceFQDN).V)

	issuedAt, err := time.Parse(time.RFC3339, string(tree.Child(abnf.IssuedAtFQDN).V))
	if err != nil {
		return err
	}
	m.IssuedAt = issuedAt

	if expirationAt := tree.Child(abnf.ExpirationAtFQDN); expirationAt != nil {
		expirationAtTime, err := time.Parse(time.RFC3339, string(expirationAt.V))
		if err != nil {
			return err
		}
		m.ExpirationAt = expirationAtTime
	}

	if notBefore := tree.Child(abnf.NotBeforeFQDN); notBefore != nil {
		notBeforeTime, err := time.Parse(time.RFC3339, string(notBefore.V))
		if err != nil {
			return err
		}
		m.NotBefore = notBeforeTime
	}

	if requestID := tree.Child(abnf.RequestIDFQDN); requestID != nil {
		m.RequestID = string(requestID.V)
	}

	resourceTrees := tree.Children(abnf.ResourceFQDN)
	resources := make([]string, len(resourceTrees))
	for _, rsTree := range resourceTrees {
		resources = append(resources, string(rsTree.V))
	}
	m.Resources = resources

	return nil
}
