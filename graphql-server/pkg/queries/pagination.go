package queries

type PaginationInfo struct {
	HasNext     bool
	HasPrevious bool
	TotalCount  int
}

type Paginated[T any] struct {
	Items          []T
	PaginationInfo PaginationInfo
}
