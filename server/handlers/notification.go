package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/config"
	"server/utils"
)

func NotifyMentions(text string, actorID uint64, postID *uint64, commentID *uint64, notifType string) {

	usernames := utils.ExtractMentions(text)

	if len(usernames) == 0 {
		return 
	}

	placeholders := make([]string, len(usernames))

	args := make([]interface{}, len(usernames))

	for i, u := range usernames {
		placeholders[i] = "?"
		args[i] = u
	}

	query := fmt.Sprintf(
		"SELECT id FROM users WHERE username IN (%s) AND deleted_at IS NULL",
		strings.Join(placeholders, ","),
	)

	rows, err := config.DB.Query(query, args...)

	if err != nil {
		return
	}

	defer rows.Close()

	for rows.Next() {

		var recipientID uint64

		if err := rows.Scan(&recipientID); err != nil {
			continue
		}

		if recipientID == actorID {
			continue
		}

		config.DB.Exec(
			`INSERT INTO notifications (uuid, recipient_id, actor_id, type, post_id, comment_id)
			VALUES (?, ?, ?, ?, ?, ?)`,
			uuid.NewString(), recipientID, actorID, notifType, postID, commentID,
		)

	}

}

func GetNotifications(c *gin.Context) {
	
	userID := c.MustGet("user_id").(uint64)

	rows, err := config.DB.Query(`
		SELECT n.uuid, n.type, n.is_read, n.created_at,
			   u.username, u.first_name, u.last_name, u.avatar_url,
			   p.uuid
		FROM notifications n
		JOIN users u ON u.id = n.actor_id
		LEFT JOIN blog_posts p ON p.id = n.post_id
		WHERE n.recipient_id = ?
		ORDER BY n.created_at DESC
		LIMIT 30
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch notifications",
		})
		return 
	}

	defer rows.Close()

	notifications := []gin.H{}

	for rows.Next() {

		var nUUID, notifType, actorUsername, actorFirst, actorLast, actorAvatar string
		var postUUID sql.NullString
		var isRead bool
		var createdAt time.Time

		if err := rows.Scan(&nUUID, &notifType, &isRead, &createdAt,
		&actorUsername, &actorFirst, &actorLast, &actorAvatar, &postUUID); err != nil {
			continue
		}

		notifications = append(notifications, gin.H{
			"uuid": nUUID,
			"type": notifType,
			"is_read": isRead,
			"created_at": createdAt,
			"actor_username": actorUsername,
			"actor_name": actorFirst + " " + actorLast,
			"actor_avatar": actorAvatar,
			"post_uuid": postUUID.String,
		})

	}

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
	})

}

func MarkNotificationRead(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	nUUID := c.Param("uuid")

	config.DB.Exec(
		`UPDATE notifications SET is_read = TRUE WHERE uuid = ? AND recipient_id = ?`,
		nUUID, userID,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "ok",
	})

}

func GetUnreadNotificationCount(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	var count int

	err := config.DB.QueryRow(
		`SELECT COUNT(*) FROM notifications WHERE recipient_id = ? AND is_read = FALSE`,
		userID,
	).Scan(&count)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch unread count",
		})
		return 
	}

	c.JSON(http.StatusOK, gin.H{
		"unread_count": count,
	})

}