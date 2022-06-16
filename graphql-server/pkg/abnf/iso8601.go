package abnf

import "github.com/fkgi/abnf"

// 4DIGIT
func DateFullYear() abnf.Rule {
	return abnf.RN(4, abnf.DIGIT())
}

// 2DIGIT  ; 01-12
func DateMonth() abnf.Rule {
	return abnf.RN(2, abnf.DIGIT())
}

// 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on month/year
func DateMday() abnf.Rule {
	return abnf.RN(2, abnf.DIGIT())
}

// 2DIGIT  ; 00-23
func TimeHour() abnf.Rule {
	return abnf.RN(2, abnf.DIGIT())
}

// 2DIGIT  ; 00-59
func TimeMinute() abnf.Rule {
	return abnf.RN(2, abnf.DIGIT())
}

// 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second rules
func TimeSecond() abnf.Rule {
	return abnf.RN(2, abnf.DIGIT())
}

// "." 1*DIGIT
func TimeSecfrac() abnf.Rule {
	return abnf.C(abnf.V('.'), abnf.R1(abnf.DIGIT()))
}

// ("+" / "-") time-hour ":" time-minute
func TimeNumOffset() abnf.Rule {
	return abnf.C(
		abnf.A(abnf.V('+'), abnf.V('-')),
		TimeHour(),
		abnf.V(':'),
		TimeMinute(),
	)
}

// "Z" / time-numoffset
func TimeOffset() abnf.Rule {
	return abnf.A(abnf.V('Z'), TimeNumOffset())
}

// date-fullyear "-" date-month "-" date-mday
func FullDate() abnf.Rule {
	return abnf.C(DateFullYear(), abnf.V('-'), DateMonth(), abnf.V('-'), DateMday())
}

// time-hour ":" time-minute ":" time-second [time-secfrac]
func PartialTime() abnf.Rule {
	return abnf.C(TimeHour(), abnf.V(':'), TimeMinute(), abnf.V(':'), TimeSecond(), abnf.O(TimeSecfrac()))
}

// partial-time time-offset
func FullTime() abnf.Rule {
	return abnf.C(PartialTime(), TimeOffset())
}

// full-date "T" full-time
func DateTime() abnf.Rule {
	return abnf.C(FullDate(), abnf.V('T'), FullTime())
}
