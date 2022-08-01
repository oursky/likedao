package abnf

import "github.com/fkgi/abnf"

const (
	AuthorityFQDN int = iota
	AddressFQDN
	StatementFQDN
	URIFQDN
	ChainIDFQDN
	NonceFQDN
	IssuedAtFQDN
	ExpirationAtFQDN
	NotBeforeFQDN
	RequestIDFQDN
	ResourcesFQDN
	ResourceFQDN
)

// https://eips.ethereum.org/EIPS/eip-4361

// domain %s" wants you to sign in with your LikeCoin account:" LF
// address LF
// LF
// [ statement LF ]
// LF
// %s"URI: " uri LF
// %s"Version: " version LF
// %s"Chain ID: " chain-id LF
// %s"Nonce: " nonce LF
// %s"Issued At: " issued-at
// [ LF %s"Expiration Time: " expiration-time ]
// [ LF %s"Not Before: " not-before ]
// [ LF %s"Request ID: " request-id ]
// [ LF %s"Resources:"
// resources ]
func AuthenticationMessage() abnf.Rule {
	return abnf.C(
		abnf.K(Authority(), AuthorityFQDN), abnf.SP(), abnf.VS("wants you to sign in with your LikeCoin account:"), abnf.LF(),
		abnf.K(_address(), AddressFQDN), abnf.LF(),
		abnf.LF(),
		abnf.O(abnf.C(abnf.K(_statement(), StatementFQDN), abnf.LF())),
		abnf.LF(),
		abnf.C(abnf.VS("URI:"), abnf.SP(), abnf.K(URI(), URIFQDN), abnf.LF()),
		abnf.C(abnf.VS("Version:"), abnf.SP(), _version(), abnf.LF()),
		abnf.C(abnf.VS("Chain ID:"), abnf.SP(), abnf.K(_chainID(), ChainIDFQDN), abnf.LF()),
		abnf.C(abnf.VS("Nonce:"), abnf.SP(), abnf.K(_nonce(), NonceFQDN), abnf.LF()),
		abnf.C(abnf.VS("Issued At:"), abnf.SP(), abnf.K(_issuedAt(), IssuedAtFQDN)),
		abnf.O(abnf.C(abnf.LF(), abnf.VS("Expiration Time:"), abnf.SP(), abnf.K(_expirationTime(), ExpirationAtFQDN))),
		abnf.O(abnf.C(abnf.LF(), abnf.VS("Not Before:"), abnf.SP(), abnf.K(_notBefore(), NotBeforeFQDN))),
		abnf.O(abnf.C(abnf.LF(), abnf.VS("Request ID:"), abnf.SP(), abnf.K(_requestID(), RequestIDFQDN))),
		abnf.O(abnf.C(abnf.LF(), abnf.VS("Resources:"), abnf.K(_resources(), ResourcesFQDN))),
		abnf.ETX(),
	)
}

// *( reserved / unreserved / " " )
func _statement() abnf.Rule {
	return abnf.R0(abnf.A(Unreserved(), Reserved(), abnf.SP()))
}

// 1*(ALPHA) "1" 1*(ALPHA / DIGIT)
func _address() abnf.Rule {
	return abnf.C(abnf.R1(abnf.ALPHA()), abnf.V('1'), abnf.R1(abnf.ALPHANUM()))
}

// "1"
func _version() abnf.Rule {
	return abnf.V('1')
}

// 1*(ALPHA / DIGIT / "-")
func _chainID() abnf.Rule {
	return abnf.R1(abnf.A(abnf.ALPHANUM(), abnf.V('-')))
}

// 8(ALPHA / DIGIT)
func _nonce() abnf.Rule {
	return abnf.RN(8, abnf.ALPHANUM())
}

// date-time
func _issuedAt() abnf.Rule {
	return DateTime()
}

// date-time
func _expirationTime() abnf.Rule {
	return DateTime()
}

// date-time
func _notBefore() abnf.Rule {
	return DateTime()
}

// *pchar
func _requestID() abnf.Rule {
	return abnf.R0(Pchar())
}

// *( LF resource )
func _resources() abnf.Rule {
	return abnf.R0(abnf.C(abnf.LF(), _resource()))
}

// "- " URI
func _resource() abnf.Rule {
	return abnf.C(abnf.V('-'), abnf.SP(), abnf.K(URI(), ResourceFQDN))
}
