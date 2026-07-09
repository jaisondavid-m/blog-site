package utils

import "regexp"

var mentionRegex = regexp.MustCompile(`@([a-zA-Z0-9_]+)`)

func ExtractMentions(text string) []string {

	matches := mentionRegex.FindAllStringSubmatch(text, -1)
	seen := map[string]bool{}
	usernames := []string{}

	for _, m := range matches {
		uname := m[1]
		if !seen[uname] {
			seen[uname] = true
			usernames = append(usernames, uname)
		}
	}

	return usernames

}