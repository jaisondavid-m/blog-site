package models

import "time"

type ReportPostInput struct {
	Reason 			string 		`json:"reason" binding:"required"`
	Description		string		`json:"description"`
}

type PostReport struct {
	ID 				uint64 		`json:"id"`
	UUID 			string 		`json:"uuid"`
	PostID 			uint64 		`json:"post_id"`
	PostUUID 		string 		`json:"post_uuid"`
	PostTitle 		string 		`json:"post_title"`
	ReporterID 		uint64 		`json:"reporter_id"`
	ReporterName 	string 		`json:"reporter_name"`
	Reason 			string 		`json:"reason"`
	Description 	string 		`json:"description"`
	Status 			string 		`json:"status"`
	CreatedAt 		time.Time 	`json:"created_at"`
}