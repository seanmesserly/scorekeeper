# Scorekeeper

This is a free and open source Disc Golf scoring application.

## Usage

First in order to run the development database you will need to add a database url to an `.env` file in the root of the project. To create a local sqlite database in the `prisma` use

```bash
DATABASE_URL='file:./dev.db'
```

Additionally you must have a secret in order to utilize JWTs for authentiction. To generate such a secret run

```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

Then to run the project use the following commands:

```bash
git clone https://github.com/seanmesserly/scorekeeper.git
cd scorekeeper
npm ci
npm run dbinit
npm run seed
npm run dev
```

