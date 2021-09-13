# Scorekeeper

This is a free and open source Disc Golf scoring application.

## Usage

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
