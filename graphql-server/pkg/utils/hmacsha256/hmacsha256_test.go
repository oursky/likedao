package hmacsha256util_test

import (
	"testing"

	hmacsha256util "github.com/oursky/likedao/pkg/utils/hmacsha256"
)

func Test_Sign(t *testing.T) {
	hash := hmacsha256util.Sign("secret", "message")

	// echo -n "message" | openssl dgst -sha256 -hmac "secret" -binary | openssl enc -base64 -A
	expectedHash := "i19IcCmVwVmMVz2x4hhmqbgl1KeU0WnXBgoDYFeWNgs="

	if hash != expectedHash {
		t.Errorf("expected %s, got %s", expectedHash, hash)
	}
}

func Test_Verify(t *testing.T) {
	t.Run("Valid hash", func(t *testing.T) {
		result := hmacsha256util.Verify("secret", "message", "i19IcCmVwVmMVz2x4hhmqbgl1KeU0WnXBgoDYFeWNgs=")

		if !result {
			t.Errorf("expected true, got false")
		}
	})

	t.Run("Invalid hash", func(t *testing.T) {
		result := hmacsha256util.Verify("secret", "message", "helloworld")

		if result {
			t.Errorf("expected false, got true")
		}
	})
}
