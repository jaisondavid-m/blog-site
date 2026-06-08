package handlers

import (

	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"server/config"
	"server/models"
	"server/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

)

const (
	OTPPurposePasswordReset 	= "password_reset"
	ResetTokenExpiryMinutes		= 10
	OTPPasswordResetExpiryMins  = 2
)

func FindAccount(c *gin.Context) {
	
}