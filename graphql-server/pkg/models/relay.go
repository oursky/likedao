package models

type PageInfo struct {
	StartCursor     *string `json:"startCursor"`
	EndCursor       *string `json:"endCursor"`
	HasNextPage     bool    `json:"hasNextPage"`
	HasPreviousPage bool    `json:"hasPreviousPage"`
}

type Edge[T any] struct {
	Cursor string `json:"cursor"`
	Node   T      `json:"node"`
}

type Connection[T any] struct {
	Edges      []Edge[T] `json:"edges"`
	PageInfo   PageInfo  `json:"pageInfo"`
	TotalCount int       `json:"totalCount"`
}

func NewConnection[T any](models []T, cursorFn func(model T) string) Connection[T] {
	edges := make([]Edge[T], 0, len(models))
	for _, model := range models {
		edges = append(edges, Edge[T]{
			Cursor: cursorFn(model),
			Node:   model,
		})
	}

	var startCursor, endCursor string
	if len(edges) > 0 {
		startCursor = edges[0].Cursor
		endCursor = edges[len(edges)-1].Cursor
	}

	return Connection[T]{
		Edges: edges,
		PageInfo: PageInfo{
			StartCursor: &startCursor,
			EndCursor:   &endCursor,
		},
	}
}
