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
			"schema": config.ServerDatabase.Schema,
		}
		err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
			// Adding regex literal directly to avoid Format breaking the pattern
			// Iscn regexp obtained from https://github.com/likecoin/likecoin-chain/blob/cf74a3160a7a8094d760bd43e838f9e138adc994/x/iscn/types/iscnid.go#L13
			_, err := tx.Exec(Format(`
				CREATE TYPE {{.schema}}.reaction_target_type AS ENUM ('proposal', 'comment', 'post');

				CREATE TABLE IF NOT EXISTS {{.schema}}.reaction (
					id TEXT PRIMARY KEY,
					reaction TEXT NOT NULL CHECK (reaction ~ '^:\w+:$'),
					address TEXT NOT NULL,
					target_id TEXT NOT NULL,
					target_type REACTION_TARGET_TYPE NOT NULL,
					created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

					UNIQUE (address, target_type, target_id),
					CONSTRAINT chk_target CHECK (
						(target_type IN ('comment', 'post') AND target_id ~ 'iscn://([-_.:=+,a-zA-Z0-9]+)/([-_.:=+,a-zA-Z0-9]+)(?:/([0-9]+))?$') OR 
						(target_type = 'proposal' AND target_id ~ '^[0-9]+$')
					)
				);

				CREATE INDEX ix_reaction_target_type_target_id_created_at ON {{.schema}}.reaction (target_type, target_id, created_at);
			`, values))
			return err
		})
		return err
	}, func(ctx context.Context, db *bun.DB) error {
		values := FormatValues{
			"schema": config.ServerDatabase.Schema,
		}
		err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
			_, err := tx.Exec(Format(`
				DROP INDEX IF EXISTS {{.schema}}.ix_reaction_target_type_target_id_created_at;
				DROP TABLE IF EXISTS {{.schema}}.reaction;
				DROP TYPE IF EXISTS {{.schema}}.reaction_target_type;
			`, values))
			return err
		})
		return err
	})
}
