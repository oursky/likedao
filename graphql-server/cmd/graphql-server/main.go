package main

import (
	"log"
	"net/http"

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

	logging.ConfigureLogger(config.Log)

	serverDB, err := database.GetDB(config.ServerDatabase)
	if err != nil {
		panic(err)
	}
	chainDB, err := database.GetDB(config.ChainDatabase)
	if err != nil {
		panic(err)
	}

	router.Use(middlewares.Services(serverDB, chainDB))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.POST("/graphql", handlers.GraphqlHandler(serverDB, chainDB))
	if gin.Mode() == gin.DebugMode {
		router.GET("/graphql", handlers.GraphqlPlaygroundHandler())
	}

	if err := router.Run(":8080"); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Listen: %s\n", err)
	}
}
