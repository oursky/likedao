package abnf

import "github.com/fkgi/abnf"

// https://datatracker.ietf.org/doc/html/rfc3986#page-49

// scheme ":" hier-part [ "?" query ] [ "#" fragment ]
func URI() abnf.Rule {
	return abnf.C(Scheme(), abnf.V(':'), HierPart(), abnf.O(abnf.C(abnf.V('?'), Query())), abnf.O(abnf.C(abnf.V('#'), Fragment())))
}

// "//" authority path-abempty
//    / path-absolute
//    / path-rootless
//    / path-empty
func HierPart() abnf.Rule {
	return abnf.C(abnf.VS("//"), Authority(), abnf.A(PathAbEmpty(), PathAbsolute(), PathRootless(), PathEmpty()))
}

// *( "/" segment )
func PathAbEmpty() abnf.Rule {
	return abnf.R0(abnf.C(abnf.V('/'), Segment()))
}

// "/" [ segment-nz *( "/" segment ) ]
func PathAbsolute() abnf.Rule {
	return abnf.C(abnf.V('/'), abnf.O(abnf.C(SegmentNz(), abnf.R0(abnf.C(abnf.V('/'), Segment())))))
}

// segment-nz-nc *( "/" segment )
func PathNoScheme() abnf.Rule {
	return abnf.C(SegmentNzNc(), abnf.R0(abnf.C(abnf.V('/'), Segment())))
}

// segment-nz *( "/" segment )
func PathRootless() abnf.Rule {
	return abnf.C(SegmentNz(), abnf.R0(abnf.C(abnf.V('/'), Segment())))
}

// 0<pchar>
func PathEmpty() abnf.Rule {
	return abnf.RV(0, 0, Pchar())
}

// *pchar
func Segment() abnf.Rule {
	return abnf.R0(Pchar())
}

// 1*pchar
func SegmentNz() abnf.Rule {
	return abnf.R1(Pchar())
}

// 1*( unreserved / pct-encoded / sub-delims / "@" )
func SegmentNzNc() abnf.Rule {
	return abnf.R1(abnf.C(Unreserved(), PctEncoded(), SubDelims(), abnf.V('@')))
}

// *( pchar / "/" / "?" )
func Fragment() abnf.Rule {
	return abnf.R0(abnf.A(Pchar(), abnf.V('/'), abnf.V('?')))
}

// *( pchar / "/" / "?" )
func Query() abnf.Rule {
	return abnf.R0(abnf.A(Pchar(), abnf.V('/'), abnf.V('?')))
}

// unreserved / pct-encoded / sub-delims / ":" / "@"
func Pchar() abnf.Rule {
	return abnf.A(
		Unreserved(),
		PctEncoded(),
		SubDelims(),
		abnf.V(':'),
		abnf.V('@'),
	)
}

// ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
func Scheme() abnf.Rule {
	return abnf.C(abnf.ALPHA(), abnf.R0(abnf.A(abnf.ALPHANUM(), abnf.V('+'), abnf.V('-'), abnf.V('.'))))
}

// [ userinfo "@" ] host [ ":" port ]
func Authority() abnf.Rule {
	return abnf.C(abnf.O(abnf.C(UserInfo(), abnf.V('@'))), Host(), abnf.O(abnf.C(abnf.V(':'), Port())))
}

// *DIGIT
func Port() abnf.Rule {
	return abnf.R0(abnf.DIGIT())
}

// Skipped IPv6Address due to high complexity
// IPv4address / reg-name
func Host() abnf.Rule {
	return abnf.A(Ipv4Address(), RegName())
}

// *( unreserved / pct-encoded / sub-delims )
func RegName() abnf.Rule {
	return abnf.R0(abnf.A(Unreserved(), PctEncoded(), SubDelims()))
}

// dec-octet "." dec-octet "." dec-octet "." dec-octet
func Ipv4Address() abnf.Rule {
	return abnf.C(DecOctet(), abnf.V('.'), DecOctet(), abnf.V('.'), DecOctet(), abnf.V('.'), DecOctet())
}

// 		DIGIT                 ; 0-9
//    / %x31-39 DIGIT         ; 10-99
//    / "1" 2DIGIT            ; 100-199
//    / "2" %x30-34 DIGIT     ; 200-249
//    / "25" %x30-35          ; 250-255
func DecOctet() abnf.Rule {
	return abnf.A(
		abnf.DIGIT(),
		abnf.C(abnf.VR(0x31, 0x39), abnf.DIGIT()),
		abnf.C(abnf.V('1'), abnf.RN(2, abnf.DIGIT())),
		abnf.C(abnf.V('2'), abnf.VR(0x30, 0x34), abnf.DIGIT()),
		abnf.C(abnf.VS("25"), abnf.VR(0x30, 0x35)),
	)
}

// *( unreserved / pct-encoded / sub-delims / ":" )
func UserInfo() abnf.Rule {
	return abnf.R1(abnf.A(Unreserved(), PctEncoded(), SubDelims(), abnf.V(':')))
}

// ALPHA / DIGIT / "-" / "." / "_" / "~"
func Unreserved() abnf.Rule {
	return abnf.A(abnf.ALPHANUM(), abnf.VL('-'), abnf.V('_'), abnf.V('.'), abnf.V('~'))
}

// gen-delims / sub-delims
func Reserved() abnf.Rule {
	return abnf.A(GenDelims(), SubDelims())
}

// "%" HEXDIG HEXDIG
func PctEncoded() abnf.Rule {
	return abnf.C(abnf.V('%'), abnf.HEXDIG(), abnf.HEXDIG())
}

// ":" / "/" / "?" / "#" / "[" / "]" / "@"
func GenDelims() abnf.Rule {
	return abnf.A(
		abnf.V(':'),
		abnf.V('/'),
		abnf.V('?'),
		abnf.V('#'),
		abnf.V('['),
		abnf.V(']'),
		abnf.V('@'),
	)
}

// "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
func SubDelims() abnf.Rule {
	return abnf.A(
		abnf.V('!'),
		abnf.V('$'),
		abnf.V('&'),
		abnf.V('\\'),
		abnf.V('('),
		abnf.V(')'),
		abnf.V('*'),
		abnf.V('+'),
		abnf.V(','),
		abnf.V(';'),
		abnf.V('='),
	)
}
