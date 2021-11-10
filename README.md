# Scorekeeper

This is a free and open source Disc Golf scoring application.

## Usage

First in order to run the development database you will need to add a database url to an `.env` file in the root of the project. To create a local sqlite database in the `prisma` use

```bash
DATABASE_URL='file:./dev.db'
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

## Generate API docs

```bash
npx redoc-cli bundle -o openapi.html openapi.yaml
```

