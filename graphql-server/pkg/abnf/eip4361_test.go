package abnf_test

import (
	"fmt"
	"testing"

	abnfparser "github.com/fkgi/abnf"
	"github.com/oursky/likedao/pkg/abnf"
)

func Test_EIP4361Message(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		authority := "likedao.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://likedao.com"
		chainID := "likecoin-mainnet-2"
		nonce := "12345678"
		issuedAt := "2006-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree == nil {
			t.Errorf("failed to parse %s", message)
		}

		resAuthority := string(tree.Child(abnf.AuthorityFQDN).V)
		if resAuthority != authority {
			t.Errorf("Authority is not %s, got %s instead", authority, resAuthority)
		}

		resAddress := string(tree.Child(abnf.AddressFQDN).V)
		if resAddress != address {
			t.Errorf("Address is not %s, got %s instead", address, resAddress)
		}

		resURI := string(tree.Child(abnf.URIFQDN).V)
		if resURI != uri {
			t.Errorf("URI is not %s, got %s instead", uri, resURI)
		}

		resChainID := string(tree.Child(abnf.ChainIDFQDN).V)
		if resChainID != chainID {
			t.Errorf("Chain ID is not %s, got %s instead", chainID, resChainID)
		}

		resNonce := string(tree.Child(abnf.NonceFQDN).V)
		if resNonce != nonce {
			t.Errorf("Nonce is not %s, got %s instead", nonce, resNonce)
		}

		resIssuedAt := string(tree.Child(abnf.IssuedAtFQDN).V)
		if resIssuedAt != issuedAt {
			t.Errorf("Issued At is not %s, got %s instead", issuedAt, resIssuedAt)
		}
	})

	t.Run("Official EIP Sample Message", func(t *testing.T) {
		message := "service.org wants you to sign in with your Likecoin account:\n" +
			"like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua\n" +
			"\n" +
			"I accept the ServiceOrg Terms of Service: https://service.org/tos\n" +
			"\n" +
			"URI: https://service.org/login\n" +
			"Version: 1\n" +
			"Chain ID: 1\n" +
			"Nonce: 32891756\n" +
			"Issued At: 2021-09-30T16:25:24Z\n" +
			"Resources:\n" +
			"- ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/\n" +
			"- https://example.com/my-web2-claim.json"
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree == nil {
			t.Errorf("failed to parse %s", message)
		}
	})

	t.Run("Invalid authority", func(t *testing.T) {
		authority := "cos%mos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "alskw01k"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid address", func(t *testing.T) {
		authority := "cosmos.com"
		address := "address"
		uri := "https://cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "alskw01k"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid uri", func(t *testing.T) {
		authority := "cosmos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "//cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "alskw01k"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid chainID", func(t *testing.T) {
		authority := "cosmos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://cosmos.com"
		chainID := "*chain"
		nonce := "alskw01k"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid nonce", func(t *testing.T) {
		authority := "cosmos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "123919292"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid issueAt", func(t *testing.T) {
		authority := "cosmos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "12345678"
		issuedAt := "20200-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 1\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

	t.Run("Invalid version", func(t *testing.T) {
		authority := "cosmos.com"
		address := "like1cq425wdjy0lg6zswt38j06kepq782mxzsuveua"
		uri := "https://cosmos.com"
		chainID := "cosmoshub-4"
		nonce := "12345678"
		issuedAt := "2020-01-02T15:04:05Z"

		message := fmt.Sprintf(
			"%s wants you to sign in with your Likecoin account:\n"+
				"%s\n"+
				"\n\n\n"+
				"URI: %s\n"+
				"Version: 2\n"+
				"Chain ID: %s\n"+
				"Nonce: %s\n"+
				"Issued At: %s", authority, address, uri, chainID, nonce, issuedAt)
		tree := abnfparser.ParseString(message, abnf.AuthenticationMessage())

		if tree != nil {
			t.Errorf("Expected to fail: %s", message)
		}
	})

}
