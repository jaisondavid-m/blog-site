package models

type TrendingWriter struct {
	ID 				uint64 		`json:"id"`
	UUID 			string 		`json:"uuid"`
	FirstName 		string 		`json:"first_name"`
	LastName 		string 		`json:"last_name"`
	UserName 		string 		`json:"username"`
	AvatarURL 		string 		`json:"avatar_url"`
	PostsCount 		uint 		`json:"post_counts"`
	TotalLikes 		uint 		`json:"total_likes"`
	TotalViews 		uint 		`json:"total_views"`
	TotalComments 	uint 		`json:"total_comments"`
}