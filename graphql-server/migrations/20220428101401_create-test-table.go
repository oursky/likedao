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
				CREATE TABLE {{.schema}}.test (
					id TEXT PRIMARY KEY,
					created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					string TEXT NOT NULL,
					int INT NOT NULL
				)
			`, values))
			return err
		})
		return err
	}, func(ctx context.Context, db *bun.DB) error {
		err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
			_, err := tx.Exec(`
				DROP TABLE {{.schema}}.test
			`)
			return err
		})
		return err
	})
}
