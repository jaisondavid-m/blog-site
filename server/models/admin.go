package models

type AdminUserListItem struct {
	ID 				uint64 		`json:"id"`
	UUID 			string 		`json:"uuid"`
	FirstName 		string 		`json:"first_name"`
	LastName 		string 		`json:"last_name"`
	Username 		string 		`json:"username"`
	Email 			string 		`json:"email"`
	Role 			string 		`json:"role"`
	AccountStatus 	string 		`json:"account_status"`
	EmailVerified 	bool 		`json:"email_verified"`
	IsGuest 		bool 		`json:"is_guest"`
	LastLoginAt 	*string 	`json:"last_login_at"`
	CreatedAt 		string 		`json:"created_at"`
}