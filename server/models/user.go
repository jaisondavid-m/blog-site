package models

type RegisterInput struct {
	FirstName 	string 		`json:"first_name"`
	LastName 	string 		`json:"last_name"`
	Username 	string 		`json:"username"`
	Email 		string 		`json:"email"`
	Password 	string 		`json:"password"`
}

type LoginInput struct {
	Username 	string 		`json:"username"`
	Email 		string 		`json:"email"`
	Password 	string 		`json:"password"`
}

type User struct {
	ID 				uint64
	UUID 			string
	FirstName 		string
	LastName 		string
	Username 		string
	Email 			string
	EmailVerified	bool
	PasswordHash 	string
	AvatarURL 		string
	IsGuest			bool
	Role 			string
}