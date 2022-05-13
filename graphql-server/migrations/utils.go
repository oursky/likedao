package migrations

import (
	"bytes"
	"html/template"
)

// FormatValues is a key value map
type FormatValues map[string]interface{}

// Format return s a formatted string
func Format(templateText string, values map[string]interface{}) string {
	var buf bytes.Buffer
	t := template.Must(template.New("").Parse(templateText))
	_ = t.Execute(&buf, values)
	return buf.String()
}
