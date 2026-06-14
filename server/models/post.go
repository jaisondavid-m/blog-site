package models

import "time"

type Post struct {

	ID 				uint64 		`json:"id"`
	UUID 			string 		`json:"uuid"`
	AuthorID 		uint64		`json:"author_id"`
	AuthorName 		string 		`json:"author_name"`
	AuthorAvatar 	string 		`json:"author_avatar"`
	Title 			string 		`json:"title"`
	Excerpt 		string 		`json:"excerpt"`
	Content 		string 		`json:"content,omitempty"`
	Tag 			string 		`json:"tag"`
	CoverImage 		string 		`json:"cover_image"`
	Status 			string 		`json:"status,omitempty"`
	ViewsCount 		uint 		`json:"views_count"`
	LikesCount 		uint 		`json:"likes_count"`
	CommentCount 	uint 		`json:"comments_count"`
	IsLiked	 		bool 		`json:"is_liked"`
	IsBookmarked 	bool 		`json:"is_bookmarked"`
	PublishedAt 	*time.Time 	`json:"published_at"`
	CreatedAt 		time.Time 	`json:"created_at"`

}