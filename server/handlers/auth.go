package handlers

import (

	"net/http"
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/config"
	"server/models"
	"server/utils"

)

func Register(c *gin.Context) {

	var input models.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Input",
		})
		return
	}

	var existingID int

	err := config.DB.QueryRow(
		"SELECT id FROM users WHERE email = ? OR username = ?",
		input.Email,
		input.Username,
	).Scan(&existingID)

	if err != sql.ErrNoRows {
		c.JSON(http.StatusConflict,gin.H{
			"error":"Email or username already exists",
		})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to hash password",
		})
		return 
	}

	userUUID := uuid.New().String()

	query := `
	INSERT INTO users (
		uuid,
		first_name,
		last_name,
		username,
		email,
		password_hash
	)
	VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := config.DB.Exec(
		query,
		userUUID,
		input.FirstName,
		input.LastName,
		input.Username,
		input.Email,
		hashedPassword,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to create user",
		})
		return
	}

	id, _ := result.LastInsertId()

	c.JSON(http.StatusCreated,gin.H{
		"message":"User registered successfully",
		"user_id":id,
	})
}

func Login(c *gin.Context) {

	var input models.LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Input",
		})
		return 
	}

	var (
		userID 			uint64
		passwordHash 	string
	)

	query := `
	SELECT
		id,
		password_hash
	FROM users
	WHERE username = ?
	LIMIT 1
	`

	err := config.DB.QueryRow(
		query,
		input.Username,
	).Scan(
		&userID,
		&passwordHash,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized,gin.H{
			"error":"Invalid username or password",
		})
		return 
	}

	validPassword := utils.CheckPasswordHash(
		input.Password,
		passwordHash,
	)

	if !validPassword {
		c.JSON(http.StatusUnauthorized,gin.H{
			"error":"Invalid username or password",
		})
		return 
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Login Successfully",
	})

}