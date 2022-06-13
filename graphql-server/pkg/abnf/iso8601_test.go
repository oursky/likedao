package abnf_test

import (
	"testing"

	abnfparser "github.com/fkgi/abnf"
	"github.com/oursky/likedao/pkg/abnf"
)

func buildABNFRule(rule abnfparser.Rule) abnfparser.Rule {
	return abnfparser.C(abnfparser.K(rule, 0), abnfparser.ETX())
}

func Test_DateTime(t *testing.T) {
	str := "1937-12-31T23:59:58.123Z"
	tree := abnfparser.ParseString(str, buildABNFRule(abnf.DateTime()))

	if tree == nil {
		t.Errorf("failed to parse %s", str)
	}

	parsedValue := string(tree.Child(0).V)

	if parsedValue != str {
		t.Errorf("parsed value %s != %s", parsedValue, str)
	}
}

func Test_DateTimeWithOffset(t *testing.T) {
	str := "1937-12-31T23:59:58.123+09:00"
	tree := abnfparser.ParseString(str, buildABNFRule(abnf.DateTime()))

	if tree == nil {
		t.Errorf("failed to parse %s", str)
	}

	parsedValue := string(tree.Child(0).V)

	if parsedValue != str {
		t.Errorf("parsed value %s != %s", parsedValue, str)
	}
}
func Test_DateTimeFail(t *testing.T) {
	str := "1937-12-31T23:59:581.123K"
	tree := abnfparser.ParseString(str, buildABNFRule(abnf.DateTime()))

	if tree != nil {
		t.Errorf("failed to parse %s", str)
	}
}
