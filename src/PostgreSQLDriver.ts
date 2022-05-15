import { Driver, TransactionSettings } from 'kysely';
import {
  ClientOptions,
  ConnectionString,
  Pool,
  TransactionOptions,
} from 'postgres';

import { PostgreSQLDriverDatabaseConnection } from './PostgreSQLDriverDatabaseConnection.ts';

export type PostgreSQLDriverOptions = ClientOptions & {
  connectionString?: ConnectionString;
};

export class PostgreSQLDriver implements Driver {
  options: PostgreSQLDriverOptions;
  poolSize: number;
  pool: Pool | null;

  constructor(options: PostgreSQLDriverOptions, poolSize = 1) {
    this.options = options;
    this.poolSize = poolSize;
    this.pool = null;
  }

  private getIsolationLevel(
    isolationlevel: TransactionSettings['isolationLevel'],
  ): TransactionOptions['isolation_level'] {
    switch (isolationlevel || 'serializable') {
      case 'read committed':
        return 'read_committed';
      case 'repeatable read':
        return 'repeatable_read';
      case undefined:
      case 'serializable':
        return 'serializable';
      case 'read uncommitted':
      default:
        throw new Error('Unsupported isolation level');
    }
  }

  // deno-lint-ignore require-await
  async init() {
    this.pool = new Pool(
      this.options.connectionString || this.options,
      this.poolSize,
      true,
    );
  }

  async acquireConnection() {
    if (!this.pool) {
      throw new Error('Driver not initialized');
    }

    const client = await this.pool.connect();

    return new PostgreSQLDriverDatabaseConnection({ client });
  }

  async beginTransaction(
    connection: PostgreSQLDriverDatabaseConnection,
    settings: TransactionSettings,
  ) {
    connection.transaction = connection.client.createTransaction(
      'TRANSACTION_NAME',
      {
        isolation_level: this.getIsolationLevel(settings.isolationLevel),
      },
    );

    await connection.transaction.begin();
  }

  async commitTransaction(connection: PostgreSQLDriverDatabaseConnection) {
    await connection.transaction?.commit();
  }

  async rollbackTransaction(connection: PostgreSQLDriverDatabaseConnection) {
    if (
      connection.transaction &&
      connection.client.session.current_transaction ===
        connection.transaction.name
    ) {
      await connection.transaction.rollback();
    }

    connection.transaction = null;
  }

  // deno-lint-ignore require-await
  async releaseConnection(connection: PostgreSQLDriverDatabaseConnection) {
    connection.client.release();
  }

  async destroy() {
    await this.pool?.end();
  }
}
