package models

import "time"

type ReportPostInput struct {
	Reason 			string 		`json:"reason" binding:"required"`
	Description		string		`json:"description"`
}

type PostReport struct {
	
}