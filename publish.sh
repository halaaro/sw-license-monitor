set -o allexport; source .env.local; set +o allexport
yarn electron:build -p always
