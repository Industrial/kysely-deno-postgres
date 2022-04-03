# Kysely Deno Postgres

Connector for [Kysely](https://github.com/koskimas/kysely) with
[deno-postgres](https://deno-postgres.com).

## Usage

```ts
import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "https://esm.sh/kysely";
import { PostgreSQLDriver } from "https://deno.land/x/kysely_deno_postgres/mod.ts";

const kysely = new Kysely({
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new PostgreSQLDriver({
        // If connectionString is passed, other options are ignored.
        // connectionString: Deno.env.get('DATABASE_URL'),
        applicationName: "MyApp",
        connection: {
          attempts: 1,
        },
        database: "postgres",
        hostname: "localhost",
        host_type: "tcp", // "tcp" | "socket"
        password: "postgres",
        port: 5432,
        tls: {
          enabled: true,
          enforce: false,
          caCertificates: [],
        },
        user: "postgres",
      });
    },
    createIntrospector(db: Kysely<unknown>) {
      return new PostgresIntrospector(db);
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler();
    },
  },
});
```
