package handlers

import (
	"context"

	gql "github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/directives"
	"github.com/oursky/likedao/pkg/errors"
	"github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/logging"
	"github.com/oursky/likedao/pkg/resolvers"
	"github.com/uptrace/bun"
)

type GraphQLOperationLogger struct{}

var _ interface {
	gql.HandlerExtension
	gql.ResponseInterceptor
} = GraphQLOperationLogger{}

func (GraphQLOperationLogger) ExtensionName() string {
	return "GraphQLOperationLogger"
}

func (GraphQLOperationLogger) Validate(schema gql.ExecutableSchema) error {
	return nil
}

func (GraphQLOperationLogger) InterceptResponse(ctx context.Context, next gql.ResponseHandler) *gql.Response {
	logger := logging.GetLogger(ctx)
	operationContext := gql.GetOperationContext(ctx)
	operationName := func() string {
		if operationContext.Operation.Name != "" {
			return operationContext.Operation.Name
		}
		return operationContext.RawQuery
	}()
	logger.Infof("Execute operation: %s\n", operationName)
	return next(ctx)
}

func GraphqlHandler(serverDB *bun.DB, chainDB *bun.DB) gin.HandlerFunc {
	c := graphql.Config{Resolvers: &resolvers.Resolver{ServerDB: serverDB, ChainDB: chainDB}}
	c.Directives.Authed = directives.Authed

	h := handler.NewDefaultServer(graphql.NewExecutableSchema(c))
	h.Use(GraphQLOperationLogger{})

	h.SetErrorPresenter(errors.DefaultErrorPresenter)
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
