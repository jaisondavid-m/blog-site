package models

type PublicProfile struct {

	ID 			uint64 		`json:"id"`
	UUID 		string 		`json:"uuid"`
	FirstName 	string 		`json:"first_name"`
	LastName 	string 		`json:"last_name"`
	Username 	string 		`json:"username"`
	AvatarURL 	string 		`json:"avatar_url"`
	CreatedAt 	string 		`json:"created_at"`
	PostsCount 	int 		`json:"post_count"`
	IsOwner 	bool 		`json:"is_owner"`

}