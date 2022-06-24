package utils

import (
	"context"
	"errors"
	"strings"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/ast"
)

// get argument by name from root field (ie query or mutation) from resolver context
func GetOperationArgument(ctx context.Context, name string) (*ast.Argument, error) {
	rootResolverCtx := graphql.GetRootFieldContext(ctx)

	var res *ast.Argument
	queryArguments := rootResolverCtx.Field.Field.Arguments
	for _, argument := range queryArguments {
		if argument.Name == name {
			res = argument
		}
	}
	if res == nil {
		return nil, errors.New("argument not found in root field")
	}
	return res, nil
}

func getArgValue(arg *ast.Argument, paths []string, variables map[string]interface{}) (string, error) {
	if len(paths) < 1 {
		return "", errors.New("invalid path provided")
	}
	var value *ast.Value = arg.Value

	for _, path := range paths {
		value = value.Children.ForName(path)
		if value == nil {
			return "", errors.New("invalid path provided")
		}
	}
	if value.Kind == ast.Variable {
		return variables[value.Raw].(string), nil
	}
	return value.Raw, nil
}

func GetOperationArgumentValue(ctx context.Context, path string) (string, error) {
	operationCtx := graphql.GetOperationContext(ctx)
	variables := operationCtx.Variables

	paths := strings.Split(path, ".")
	if len(paths) < 1 {
		return "", errors.New("invalid path provided")
	}

	argument, err := GetOperationArgument(ctx, paths[0])
	if err != nil {
		return "", err
	}
	if argument == nil {
		return "", nil
	}

	rawValue, err := getArgValue(argument, paths[1:], variables)
	if err != nil {
		return "", err
	}
	return rawValue, nil
}
