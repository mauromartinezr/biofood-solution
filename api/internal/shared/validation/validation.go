package validation

import "strings"

func Required(value string) bool {
	return strings.TrimSpace(value) != ""
}
