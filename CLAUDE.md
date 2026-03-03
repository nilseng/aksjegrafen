# Aksjegrafen

Norwegian stock market ownership graph. Visualizes companies, shareholders, and their relationships using force-directed graphs. Goal: outcompete proff.no by surfacing ownership insights they structurally cannot (hidden chains, cross-ownership, community clusters).

## Architecture

Monorepo: `client/` (React SPA) + `server/` (Express API) + `infrastructure/` (Terraform).

- **Frontend:** React 17, Redux Toolkit, TypeScript, Tailwind CSS, D3.js force simulation
- **Backend:** Express 4, TypeScript, MongoDB 5 (data store), Neo4j 5 (graph queries)
- **Data pipeline:** CSV (Shareholder Registry) → MongoDB → Neo4j. Three steps: `npm run import:mongodb`, `npm run import:transform`, `npm run import:graph`

## Key Directories

```
server/src/
  use-cases/       # Business logic (one file per operation)
  gateways/neo4j/  # Cypher queries and node mapping
  gateways/mongoDB/ # MongoDB queries
  routes/          # Express route handlers (api.ts, brreg.ts)
  services/        # Import orchestration and transformation
  database/        # Connection setup (graphDB.ts, mongoDB.ts)
  models/          # TypeScript interfaces
  migrations/      # One-off data migrations

client/src/
  components/Graph/ # D3 visualization (Graph.tsx, GraphView.tsx, GraphNode.tsx)
  slices/           # Redux Toolkit slices (graphSlice, modalSlice, rolesSlice)
  hooks/            # Custom hooks (useGraph, useForceSimulation, useSvgZoom)
  services/         # API clients (apiService.ts, brregService.ts)
  models/           # Frontend TypeScript interfaces
```

## Data Model (Neo4j)

**Labels:** `Company`, `Shareholder`, `Person`, `Unit`, `Organization`
**Key relationship:** `OWNS` (properties: year, stocks, share)
**Role relationships:** `DAGL` (CEO), `BEST` (board), `LEDE`, `NEST`, `VARA`, `REPR`, `REVI` + 15 more
**Fulltext index:** `namesAndOrgnrs` on name + orgnr across all labels
**GDS projections:** `directedGraph`, `undirectedGraph` — currently used for shortest path (Dijkstra) and k-shortest paths (Yen's)

## Environment Variables

```
DB_URI / MONGODB_URI   # MongoDB connection string
NEO4J_URL              # Neo4j bolt URL
NEO4J_USERNAME         # Neo4j user
NEO4J_PWD              # Neo4j password
PORT                   # Server port (default: 4000)
CORS_ALLOWED_ORIGINS   # CORS (default: "*")
```

## Conventions

- Use-case pattern: one exported function per file in `server/src/use-cases/`
- Gateway pattern: database queries isolated in `server/src/gateways/`
- Redux state via `@reduxjs/toolkit` createSlice
- Norwegian UI text (e.g. "Regnskap", "Aksjonærer")
- No test suite currently exists — new code should include tests
- No linter/formatter config beyond default react-app ESLint

## Agent Team Structure

When using Claude Code Agent Teams for development, use these 4 teammates:

### 1. Graph Intelligence
**Owns:** `server/src/use-cases/`, `server/src/gateways/neo4j/`, `server/src/database/graphDB.ts`
**Focus:**
- New GDS algorithms: community detection (Louvain/Label Propagation), centrality (PageRank, betweenness), similarity
- Ownership chain detection beyond direct holdings
- Cypher query optimization (current queries use string interpolation — parameterize them)
- Temporal ownership analysis: detect changes across years 2015–2024
- New use-cases: `findCommunities`, `findInfluentialNodes`, `findOwnershipChains`

### 2. Frontend & Visualization
**Owns:** `client/src/`
**Focus:**
- D3 performance for large graphs (canvas rendering, node clustering, level-of-detail)
- New visualization modes: ownership timeline, heatmap of concentration, treemap for sectors
- Company detail panels: richer financials, role history, ownership trend charts
- Search UX: autocomplete, filters by sector/size/region, saved searches
- Mobile responsiveness and accessibility

### 3. API & Data Pipeline
**Owns:** `server/src/routes/`, `server/src/services/`, `server/src/importCli.ts`, `server/src/migrations/`
**Focus:**
- API pagination, caching (Redis/in-memory), and rate limiting
- New data sources: Brønnøysund Enhetsregisteret (full company details), Regnskapsregisteret (financial statements), beneficial ownership registry
- Aggregate analytics endpoints: sector concentration, top holders, ownership network stats
- Input validation hardening (express-validator already installed)
- Import pipeline robustness: incremental updates, error recovery, progress reporting

### 4. Infrastructure & Quality
**Owns:** `infrastructure/`, `package.json`, tsconfig files, CI/CD
**Focus:**
- Test framework setup (Vitest for server, React Testing Library for client)
- CI pipeline: lint, type-check, test on every PR
- Neo4j performance monitoring and query profiling
- API documentation (OpenAPI/Swagger — ApiDocs.tsx already exists)
- Security audit: parameterize all Cypher queries, audit JWT setup, review CORS policy
- Docker Compose for local dev (MongoDB + Neo4j + app)

## Why This Team Beats proff.no

proff.no shows flat company data: search, basic financials, board members, simple ownership tables. Aksjegrafen's graph foundation enables insights they cannot provide:

- **Graph Intelligence** surfaces hidden ownership chains, circular ownership, and community clusters — structural advantages impossible with relational data
- **Frontend & Visualization** makes complex graph data intuitive for non-technical users
- **API & Data Pipeline** expands coverage beyond shareholder CSV to match proff.no's breadth while maintaining graph depth
- **Infrastructure & Quality** ensures the platform is reliable, fast, and trustworthy enough for professional use
