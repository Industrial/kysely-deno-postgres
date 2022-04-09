import {
  CompiledQuery,
  DatabaseConnection,
} from "https://esm.sh/kysely@0.17.1/dist/esm/index-nodeless.js";
import {
  PoolClient,
  Transaction,
} from "https://deno.land/x/postgres@v0.15.0/mod.ts";

export class PostgreSQLDriverDatabaseConnection implements DatabaseConnection {
  client: PoolClient;
  transaction: Transaction | null;

  constructor(options: { client: PoolClient }) {
    this.client = options.client;
    this.transaction = null;
  }

  async executeQuery<T>(compiledQuery: CompiledQuery) {
    return await (this.transaction ?? this.client).queryObject<T>(
      compiledQuery.sql,
      compiledQuery.parameters as unknown[],
    );
  }
}
