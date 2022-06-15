package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/database"
	"github.com/oursky/likedao/pkg/handlers"
	"github.com/oursky/likedao/pkg/logging"
	"github.com/oursky/likedao/pkg/middlewares"
)

func main() {
	config := config.LoadConfigFromEnv()
	log.Printf("Using config: %v", config)

	router := gin.Default()

	if config.Log.Sentry != nil {
		sentryClientOption := sentry.ClientOptions{
			Dsn:         config.Log.Sentry.DSN,
			Environment: config.Log.Sentry.Environment,
		}

		if err := sentry.Init(sentryClientOption); err != nil {
			panic(fmt.Sprintf("Failed to initialize sentry: %v\n", err))
		}
		router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))

		// Flush buffered events before the program terminates.
		// Set the timeout to the maximum duration the program can afford to wait.
		defer sentry.Flush(2 * time.Second)
	}

	logging.ConfigureLogger(config.Log)
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = config.Cors.AllowOrigins
	corsConfig.AllowCredentials = true

	serverDB, err := database.GetDB(config.ServerDatabase)
	if err != nil {
		panic(err)
	}
	chainDB, err := database.GetDB(config.ChainDatabase)
	if err != nil {
		panic(err)
	}

	router.Use(cors.New(corsConfig))
	router.Use(middlewares.Services(config, serverDB, chainDB))

	auth := router.Group("/auth")
	{
		auth.GET("/nonce", handlers.NonceHandler(config.Session))
		auth.POST("/verify", handlers.VerificationHandler(config.Session))
	}
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.POST("/graphql", middlewares.Authentication(config), handlers.GraphqlHandler(serverDB, chainDB))
	if gin.Mode() == gin.DebugMode {
		router.GET("/graphql", handlers.GraphqlPlaygroundHandler())
	}

	if err := router.Run(":8080"); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Listen: %s\n", err)
	}
}
