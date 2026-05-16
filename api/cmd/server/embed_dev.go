//go:build !prod

package main

import "embed"

// embedFS is empty in dev mode — the React app is served by Vite on :5173.
var embedFS embed.FS
