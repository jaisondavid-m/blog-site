package config

import (

	"os"
	"log"
	"context"

	"github.com/redis/go-redis/v9"

)

var RDB *redis.Client
var Ctx = context.Background()

func ConnectRedis() {

	RDB = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
		Password: os.Getenv("REDIS_PASSWORD"),
	})

	if err := RDB.Ping(Ctx).Err(); err != redis.Nil {
		log.Fatalf("Failed to connect to redis: %v", err)
	}

	log.Println("Connected to Redis")

}