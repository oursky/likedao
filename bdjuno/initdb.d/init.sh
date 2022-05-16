
#!/bin/sh
set -e

TEST_DATABASE_NAME=${TEST_DATABASE_NAME:-test-$DATABASE_NAME}

# Create if not exists
psql --username "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1 || \
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "CREATE DATABASE \"$DATABASE_NAME\" WITH ENCODING 'UTF8';"
psql --username "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$TEST_DATABASE_NAME'" | grep -q 1 || \
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "CREATE DATABASE \"$TEST_DATABASE_NAME\" WITH ENCODING 'UTF8';"
# Create user and grant access
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "CREATE USER \"$DATABASE_USER\" WITH ENCRYPTED PASSWORD '$DATABASE_PASSWORD';"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE \"$DATABASE_NAME\" TO \"$DATABASE_USER\";"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "ALTER USER \"$DATABASE_USER\" WITH superuser;"
psql -v ON_ERROR_STOP=1 --username "$DATABASE_USER" -c "CREATE SCHEMA \"$DATABASE_SCHEMA\"" $DATABASE_NAME;

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -c "GRANT ALL PRIVILEGES ON DATABASE \"test-$DATABASE_NAME\" TO \"$DATABASE_USER\";"
psql -v ON_ERROR_STOP=1 --username "$DATABASE_USER" -c "CREATE SCHEMA \"$DATABASE_SCHEMA\"" test-$DATABASE_NAME;

for schema in /var/src/schemas/*.sql; do
	psql -v ON_ERROR_STOP=1 --username "$DATABASE_USER" -f $schema $DATABASE_NAME;
done