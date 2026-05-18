//go:build prod

package main

import "embed"

//go:embed dist
var embedFS embed.FS
