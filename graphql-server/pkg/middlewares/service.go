package middlewares

import (
	"github.com/gin-gonic/gin"
	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/uptrace/bun"
)

func Services(
	serverDB *bun.DB,
	chainDB *bun.DB,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := pkgContext.NewRequestContext(c.Request.Context(), serverDB, chainDB)
		c.Request = c.Request.WithContext(ctx)
	}
}
