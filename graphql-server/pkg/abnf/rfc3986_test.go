package abnf_test

import (
	"testing"

	abnfparser "github.com/fkgi/abnf"
	"github.com/oursky/likedao/pkg/abnf"
)

func Test_URI(t *testing.T) {
	t.Run("Basic URI", func(t *testing.T) {
		str := "http://example.com/"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("URI with Path", func(t *testing.T) {
		str := "https://example.com/path/to/file.html"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("URI with query", func(t *testing.T) {
		str := "https://example.com/path/to/file.html?q=1&q=2"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("URI with fragment", func(t *testing.T) {
		str := "https://example.com/path/to/file.html#fragment"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("IP address as URI", func(t *testing.T) {
		str := "http://192.168.1.93/"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("IP address as URI with Path", func(t *testing.T) {
		str := "http://192.168.1.93/hello/world"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("IP address as URI with Query", func(t *testing.T) {
		str := "http://192.168.1.93/hello/world?page=1"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})

	t.Run("IP address as URI with Fragment", func(t *testing.T) {
		str := "http://192.168.1.93/hello/world#segment"
		tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

		if tree == nil {
			t.Errorf("failed to parse %s", str)
		}
	})
}

func Test_URIFail(t *testing.T) {
	str := "://example.com/hello/world#segment"
	tree := abnfparser.ParseString(str, buildABNFRule(abnf.URI()))

	if tree != nil {
		t.Errorf("failed to parse %s", str)
	}
}
