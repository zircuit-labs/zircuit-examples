# ZRC Token Subgraph Example

## Video

[![ZRC Token Subgraph Example Video](http://img.youtube.com/vi/apN_SxUtGX8/0.jpg)](https://www.youtube.com/watch?v=apN_SxUtGX8 "Subgraphs 101: Everything You Need to Know + Building Your First Subgraph")

A subgraph for indexing ERC-20 style token activity (Transfers). It includes:

- Schema and mappings for `Token`, `Account`, and `Transfer` entities
- Event handlers for `Transfer`
- Deterministic unit tests using Matchstick
- Local development via Docker (Graph Node + IPFS + Postgres)

## Important Notices

- This repository is a sample for demonstration/education. It is not production-ready.
- This repository is excluded from all Zircuit bug bounty programs.
- This package is not published on npmjs.

## Project Structure

- `schema.graphql` — Entity definitions
- `subgraph.yaml` — Data sources and mappings configuration
- `src/mapping.ts` — Event handlers (`handleTransfer`)
- `abis/Token.json` — Contract ABI used by codegen
- `tests/` — Matchstick unit tests and utilities
- `docker-compose.yml` — Local Graph Node stack

## Prerequisites

- Node.js (LTS recommended) and npm
- Docker and Docker Compose (for local Graph Node)
- Graph CLI installed locally or via npm scripts

If you prefer a global Graph CLI:

```bash
npm install -g @graphprotocol/graph-cli@0.97.1
```

## Install

Use `npm ci` to ensure reproducible installs based on the lockfile. Do not use `npm install`.

```bash
npm ci
```

## Codegen, Build, and Test

Generate types from the schema and ABIs:

```bash
npm run codegen
```

Build the subgraph:

```bash
npm run build
```

Run unit tests with Matchstick:

```bash
npm run test
```

## Mappings Overview

File: `src/mapping.ts`

- `handleTransfer(event)`
  - Ensures `Token` entity exists for `event.address`.
  - Ensures `Account` entities exist for `event.params.from` and `event.params.to`.
  - Updates account balances using the contract's `balanceOf` (via `try_` calls).
  - Records a `Transfer` entity with ID `txHash-logIndex` and fields: `from`, `to`, `value`, `timestamp`, `blockNumber`, `transactionHash`.

## Schema Overview

File: `schema.graphql`

Entities:

- `Token` — One per token contract address. Includes `name`, `symbol`, `decimals`, `totalSupply`.
- `Account` — One per holder address with `balance`.
- `Transfer` — Transfer records with `from`, `to`, `value`, `timestamp`, `blockNumber`, `transactionHash`.

## Subgraph Manifest

File: `subgraph.yaml`

- Kind: `ethereum/events`
- Language: `wasm/assemblyscript`
- Entities: `Token`, `Account`, `Transfer`
- ABI: `abis/Token.json`
- Event handlers:
  - `Transfer(indexed address,indexed address,uint256)` → `handleTransfer`
- Mapping file: `src/mapping.ts`

## Local Development (Graph Node)

Start a local stack with IPFS, Graph Node, and Postgres:

```bash
docker-compose up -d
```

Create the subgraph in your local node (one-time):

```bash
npm run create-local
```

Deploy to local Graph Node:

```bash
npm run deploy-local
```

Tear down local subgraph:

```bash
npm run remove-local
```

Stop the Docker services when finished:

```bash
docker-compose down
```

## License

MIT
