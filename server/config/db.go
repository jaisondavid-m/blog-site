package config

import (

	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	_ "github.com/go-sql-driver/mysql"

)

var DB *sql.DB

func ConnectDB() {

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		user,
		password,
		host,
		port,
		dbname,
	)

	db, err := sql.Open("mysql",dsn)

	if err != nil {
		log.Fatal("Failed to open database")
	}

	err = db.Ping()

	if err != nil {
		log.Fatal("Failed to connect database")
	}

	DB = db

	fmt.Println("Database Connected Successfully")

}