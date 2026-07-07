package models

import "time"

type Comment struct {

	ID 				uint64 			`json:"id"`
	UUID 			string 			`json:"uuid"`
	PostID 			uint64 			`json:"post_id"`
	UserID 			uint64 			`json:"user_id"`
	AuthorName 		string 			`json:"author_name"`
	AuthorAvatar 	string 			`json:"author_avatar"`
	ParentCommentID *uint64 		`json:"parent_comment_id"`
	CommentText 	string 			`json:"comment_text"`
	LikesCount 		uint 			`json:"likes_count"`
	CreatedAt 		time.Time 		`json:"created_at"`
	Replies 		[]*Comment 		`json:"replies"`
	Liked 			bool			`json:"liked"`

}

type CreateCommentInput struct {
	CommentText 		string 		`json:"comment_text" binding:"required"`
	ParentCommentID 	*uint64 	`json:"parent_comment_id"`
}

type UpdateCommentInput struct {
	CommentText 		string		`json:"comment_text" binding:"required"`
}