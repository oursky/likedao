package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
)

const (
	NonceCookieName = "auth_nounce"
)

//nolint:errcheck
func NonceHandler(sessionConfig config.SessionConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		nonceBytes := make([]byte, 4)
		if _, err := rand.Read(nonceBytes); err != nil {
			c.Error(err)
			return
		}
		nonce := hex.EncodeToString(nonceBytes)
		expiryTime := time.Now().Add(time.Duration(sessionConfig.NonceExpiry) * time.Second)

		encodedNonce := (&models.ExpirableValue{
			Value:      nonce,
			ExpiryTime: expiryTime,
		}).Encode()

		SetSignedCookie(c, NonceCookieName, encodedNonce, sessionConfig.NonceExpiry, "/auth")
		c.String(200, nonce)
	}
}
