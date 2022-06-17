package middlewares

import (
	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/config"
	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/oursky/likedao/pkg/handlers"
	"github.com/oursky/likedao/pkg/logging"
	"github.com/oursky/likedao/pkg/models"
)

type AuthMagicDebugHeader struct {
	Address string `header:"x-magic-user-address"`
}

func Authentication(
	config config.Config,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		logger := logging.GetLogger(c.Request.Context())
		if gin.Mode() == gin.DebugMode {
			magicHeader := AuthMagicDebugHeader{}
			_ = c.ShouldBindHeader(&magicHeader)
			if magicHeader.Address != "" {
				ctx := pkgContext.NewRequestContextWithAuthedUser(c.Request.Context(), magicHeader.Address)
				c.Request = c.Request.WithContext(ctx)
				return
			}
		}

		sessionToken, err := handlers.GetSignedCookie(c, handlers.SessionCookieName)
		if err != nil {
			logger.Debugf("failed to get and verify signed cookie: %s", err)
			return
		}

		sessionTokenData := new(models.ExpirableValue)
		if err := sessionTokenData.ParseString(sessionToken); err != nil {
			logger.Debugf("failed to parse session token: %s", err)
			return
		}

		if sessionTokenData.IsExpired() {
			return
		}

		ctx := pkgContext.NewRequestContextWithAuthedUser(c.Request.Context(), sessionTokenData.Value)
		c.Request = c.Request.WithContext(ctx)
	}
}
