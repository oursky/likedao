package hmacsha256util

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
)

func Sign(secret string, message string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, err := mac.Write([]byte(message))
	if err != nil {
		panic(err)
	}
	hash := mac.Sum(nil)
	return base64.StdEncoding.EncodeToString(hash)
}

func Verify(secret string, message string, signature string) bool {
	expected := Sign(secret, message)
	return signature == expected
}
