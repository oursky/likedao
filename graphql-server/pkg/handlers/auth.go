package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cosmos/cosmos-sdk/types/bech32"
	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
)

const (
	NonceCookieName   = "auth_nounce"
	SessionCookieName = "auth_session"
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

//nolint:errcheck
func VerificationHandler(sessionConfig config.SessionConfig) gin.HandlerFunc {
	return func(c *gin.Context) {

		// Verify nonce cookie
		signedNonce, err := GetSignedCookie(c, NonceCookieName)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("nonce is either missing or invalid: %s", err))
			return
		}

		nonce := new(models.ExpirableValue)
		if err := nonce.ParseString(signedNonce); err != nil {
			c.AbortWithError(400, fmt.Errorf("nonce is either missing or invalid: %s", err))
			return
		}

		if nonce.IsExpired() {
			c.AbortWithError(400, fmt.Errorf("nonce is either missing or invalid"))
			return
		}

		// Decode request body
		var body models.AuthenticationRequestData
		if err := c.BindJSON(&body); err != nil {
			c.AbortWithError(400, fmt.Errorf("data or signature is empty or invalid: %s", err))
			return
		}

		data, err := base64.StdEncoding.DecodeString(body.SignDoc.Messages[0].Value.Data)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("unable to decode data: %s", err))
			return
		}

		// Parse request body with ABNF
		authenticationMsg := new(models.AuthenticationMessage)
		if err := authenticationMsg.ParseAbnf(string(data)); err != nil {
			c.AbortWithError(400, fmt.Errorf("failed to parse authentication message: %s", err))
			return
		}

		// Verify message ownership
		pubKey, err := body.Signature.PubKey.ToPubKey()
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("failed to parse pubkey: %s", err))
			return
		}

		_, authAddressBytes, err := bech32.DecodeAndConvert(authenticationMsg.Address)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("failed to parse authentication address: %s", err))
			return
		}

		if res := bytes.Compare(authAddressBytes, pubKey.Address()); res != 0 {
			c.AbortWithError(400, fmt.Errorf("signer address does not match the public key: %s", err))
			return
		}

		// Verify request nonce is expected
		if nonce.Value != authenticationMsg.Nonce {
			c.AbortWithError(400, fmt.Errorf("nonce is either missing or invalid"))
			return
		}

		// Verify request signature
		decodedSignature, err := base64.StdEncoding.DecodeString(body.Signature.Signature)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("failed to verify signature: %s", err))
			return
		}

		marshalledMessage, err := json.Marshal(body.SignDoc)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("failed to verify signature: %s", err))
			return
		}

		sigValid := pubKey.VerifySignature(marshalledMessage, decodedSignature)

		if !sigValid {
			c.AbortWithError(400, fmt.Errorf("signature invalid"))
			return
		}

		// Sign session token
		expiryDate := time.Now().Add(time.Duration(sessionConfig.SessionExpiry) * time.Second)
		sessionToken := (&models.ExpirableValue{
			Value:      authenticationMsg.Address,
			ExpiryTime: expiryDate,
		}).Encode()

		// Invalidate nonce cookie
		RemoveSignedCookie(c, NonceCookieName, "/auth")
		// Set session token
		SetSignedCookie(c, SessionCookieName, sessionToken, sessionConfig.SessionExpiry, "/")

		c.Status(204)
	}
}

//nolint:errcheck
func LogoutHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Remove session token
		RemoveSignedCookie(c, SessionCookieName, "/")

		c.Status(200)
	}
}

//nolint:errcheck
func ValidateHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var body models.TokenValidationRequestData
		if err := c.BindJSON(&body); err != nil {
			c.AbortWithError(400, fmt.Errorf("address is empty or invalid: %s", err))
			return
		}

		sessionToken, err := GetSignedCookie(c, SessionCookieName)
		if err != nil {
			c.AbortWithError(400, fmt.Errorf("session token is either missing or invalid: %s", err))
			return
		}

		sessionTokenData := new(models.ExpirableValue)
		if err := sessionTokenData.ParseString(sessionToken); err != nil {
			c.AbortWithError(400, fmt.Errorf("session token is either missing or invalid: %s", err))
			return
		}

		if sessionTokenData.IsExpired() {
			RemoveSignedCookie(c, SessionCookieName, "/")
			c.AbortWithError(401, fmt.Errorf("session token has expired"))
			return
		}

		if sessionTokenData.Value != body.Address {
			RemoveSignedCookie(c, SessionCookieName, "/")
			c.AbortWithError(401, fmt.Errorf("session token does not match the address"))
			return
		}

		c.Status(200)
	}
}
