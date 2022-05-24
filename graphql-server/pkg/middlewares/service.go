package middlewares

import (
	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/config"
	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/uptrace/bun"
)

func Services(
	config config.Config,
	serverDB *bun.DB,
	chainDB *bun.DB,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := pkgContext.NewRequestContext(c.Request.Context(), serverDB, chainDB, config)
		c.Request = c.Request.WithContext(ctx)
	}
}
