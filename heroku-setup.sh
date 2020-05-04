#!/usr/bin/env sh

########################################
#    THESE ARE THE CRITICAL SETTINGS   #
########################################

# The name of the Heroku app to create.
# Must start with a letter, end with a letter or digit and can only contain lowercase letters, digits, and dashes.
export APP_NAME="alan-v2"

# The name of the database to create.
# Must be under 48 characters long, shorter is better.
# Should only contain characters valid in a PostgreSQL identifier (i.e. no hyphens!)
export DATABASE_NAME="$(echo "$APP_NAME" | tr '-' '_')"
# e.g. export DATABASE_NAME="my_database_name_here"

# Database location (including :port, if it's not the standard :5432)
export DATABASE_HOST="35.188.115.102"

# Superuser credentials, used for creating the database
export DATABASE_SUPERUSER="postgres"
export DATABASE_SUPERUSER_PASSWORD="Alanwu131441"

########################################
#    PLEASE PROOF-READ THE BELOW,      #
#    PARTICULARLY THE DATABASE SETUP   #
########################################

# Echo commands, exit on error
set -e -x

# Database roles
export DATABASE_OWNER="${DATABASE_NAME}"
export DATABASE_AUTHENTICATOR="${DATABASE_NAME}_authenticator"
export DATABASE_VISITOR="${DATABASE_NAME}_visitor"

# Database credentials
export DATABASE_OWNER_PASSWORD="$(openssl rand -base64 30 | tr '+/' '-_')"
export DATABASE_AUTHENTICATOR_PASSWORD="$(openssl rand -base64 30 | tr '+/' '-_')"

# We're using 'template1' because we know it should exist. We should not actually change this database.
export SUPERUSER_TEMPLATE1_URL="postgres://${DATABASE_SUPERUSER}:${DATABASE_SUPERUSER_PASSWORD}@${DATABASE_HOST}/template1"
export SUPERUSER_DATABASE_URL="postgres://${DATABASE_SUPERUSER}:${DATABASE_SUPERUSER_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}"

echo
echo
echo "Testing database connection"
psql -X1v ON_ERROR_STOP=1 "${SUPERUSER_TEMPLATE1_URL}" -c 'SELECT true AS success'

echo
echo
echo "Creating Heroku app"
# heroku apps:create "$APP_NAME"

echo
echo
echo "Provisioning the free redis addon"
# heroku addons:create heroku-redis:hobby-dev -a "$APP_NAME"

# echo
# echo
# echo "Creating the database and the roles"
# psql -Xv ON_ERROR_STOP=1 "${SUPERUSER_TEMPLATE1_URL}" <<HERE
# CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}';
# GRANT ${DATABASE_OWNER} TO ${DATABASE_SUPERUSER};
# CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;
# CREATE ROLE ${DATABASE_VISITOR};
# GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};

# -- Create database
# CREATE DATABASE ${DATABASE_NAME} OWNER ${DATABASE_OWNER};

# -- Database permissions
# REVOKE ALL ON DATABASE ${DATABASE_NAME} FROM PUBLIC;
# GRANT ALL ON DATABASE ${DATABASE_NAME} TO ${DATABASE_OWNER};
# GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${DATABASE_AUTHENTICATOR};
# HERE

echo
echo
echo "Installing extensions into the database"
psql -X1v ON_ERROR_STOP=1 "${SUPERUSER_DATABASE_URL}" <<HERE
-- Add extensions
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
HERE


# Autogenerated settings from your settings above
export DATABASE_URL="postgres://${DATABASE_OWNER}:${DATABASE_OWNER_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}"
export AUTH_DATABASE_URL="postgres://${DATABASE_AUTHENTICATOR}:${DATABASE_AUTHENTICATOR_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}"

echo
echo
echo "Setting the Heroku variables"
heroku config:set \
  NODE_ENV="production" \
  DATABASE_URL="${DATABASE_URL}?ssl=true&sslrootcert=../../data/amazon-rds-ca-cert.pem" \
  AUTH_DATABASE_URL="${AUTH_DATABASE_URL}?ssl=true&sslrootcert=../../data/amazon-rds-ca-cert.pem" \
  DATABASE_AUTHENTICATOR="${DATABASE_AUTHENTICATOR}" \
  DATABASE_VISITOR="${DATABASE_VISITOR}" \
  SECRET="$(openssl rand -base64 48)" \
  JWT_SECRET="$(openssl rand -base64 48)" \
  ROOT_URL="https://${APP_NAME}.herokuapp.com" \
  -a "$APP_NAME"

echo
echo
echo "Pushing to Heroku"
git push heroku master:master

