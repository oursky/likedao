package handlers

import (
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func GraphqlPlaygroundHandler() gin.HandlerFunc {
	h := playground.Handler("LikeDAO Playground", "/graphql")
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
