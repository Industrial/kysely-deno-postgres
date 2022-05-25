import { kysely, postgres } from '../deps.ts';

export class PostgreSQLDriverDatabaseConnection
  implements kysely.DatabaseConnection {
  client: postgres.PoolClient;
  transaction: postgres.Transaction | null;

  constructor(options: { client: postgres.PoolClient }) {
    this.client = options.client;
    this.transaction = null;
  }

  async executeQuery<T>(compiledQuery: kysely.CompiledQuery) {
    return await (this.transaction ?? this.client).queryObject<T>(
      compiledQuery.sql,
      compiledQuery.parameters as unknown[],
    );
  }
}
