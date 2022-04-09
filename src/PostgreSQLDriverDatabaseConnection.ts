import { CompiledQuery, DatabaseConnection } from 'kysely';
import { PoolClient, Transaction } from 'postgres';

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
