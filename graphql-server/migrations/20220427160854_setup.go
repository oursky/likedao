package migrations

import (
	"context"
	"database/sql"

	"github.com/oursky/likedao/pkg/config"
	"github.com/uptrace/bun"
)

func init() {
	config := config.LoadConfigFromEnv()

	Migrations.MustRegister(func(ctx context.Context, db *bun.DB) error {
		values := FormatValues{
			"schema": config.Database.Schema,
		}
		err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
			_, err := tx.Exec(Format(`
				CREATE SCHEMA IF NOT EXISTS {{.schema}}
			`, values))
			return err
		})
		return err
	}, func(ctx context.Context, db *bun.DB) error {
		values := FormatValues{
			"schema": config.Database.Schema,
		}
		err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
			_, err := tx.Exec(Format(`
				DROP SCHEMA IF EXISTS {{.schema}}
			`, values))
			return err
		})
		return err
	})
}
