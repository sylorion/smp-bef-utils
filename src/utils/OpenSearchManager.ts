// src/utils/OpenSearchManager.ts
import { Client, ClientOptions, ApiResponse, RequestParams } from '@opensearch-project/opensearch';

/**
 * Describes the configuration needed to connect to an OpenSearch cluster.
 * @param node - The URL(s) of the OpenSearch node(s) (e.g. 'https://opensearch.mycompany.com:9200')
 * @param auth - Optional basic auth credentials.
 * @param ssl  - Optional SSL settings: cert, rejectUnauthorized, etc.
 * @param maxRetries - Maximum number of retries for network failures (default: 3).
 * @param requestTimeout - Per-request timeout in milliseconds (default: 60000 ms).
 */
export interface OpenSearchManagerConfig {
  node: string | string[];
  auth?: {
    username: string;
    password: string;
  };
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string; // e.g., provide a custom CA cert
  };
  maxRetries?: number;
  requestTimeout?: number;
}

/**
 * Represents a document to be indexed in OpenSearch.
 * @param id - Unique document ID (optional if auto-generated).
 * @param body - JSON object that holds the actual content to index.
 */
export interface IndexDocument {
  id?: string;
  body: Record<string, any>;
}

/**
 * Main class to interact with an OpenSearch cluster.
 *
 * Ideally placed in a shared library and reused across microservices
 * that need to manage indexing and searching within OpenSearch.
 */
export class OpenSearchManager {
  private client: Client;

  /**
   * Builds an OpenSearchManager instance with an underlying OpenSearch client.
   * @param config - Connection configuration for the OpenSearch cluster.
   */
  constructor(config: OpenSearchManagerConfig) {
    const clientOptions: ClientOptions = {
      node: config.node,
      auth: config.auth,
      ssl: config.ssl,
      maxRetries: config.maxRetries ?? 3,
      requestTimeout: config.requestTimeout ?? 60000,
    };

    this.client = new Client(clientOptions);
  }

  /**
   * Checks whether an index exists; if not, creates it with optional mappings/settings.
   * @param index - Name of the index.
   * @param body  - Request body for index creation, possibly including `mappings` and `settings`.
   */
  public async ensureIndex(
    index: string,
    body?: {
      settings?: Record<string, any>;
      mappings?: Record<string, any>;
      aliases?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index });
      if (!exists.body) {
        await this.client.indices.create({ index, body });
        console.log(`Index '${index}' was successfully created.`);
      }
    } catch (error) {
      console.error(`Error creating or checking index '${index}':`, error);
      throw error;
    }
  }

  /**
   * Indexes (creates or updates) a single document in a given index.
   * @param index - Name of the OpenSearch index.
   * @param doc   - Document to index, containing the `body` and optional `id`.
   */
  public async indexDocument(index: string, doc: IndexDocument): Promise<void> {
    try {
      await this.client.index({
        index,
        id: doc.id,
        body: doc.body,
        refresh: 'wait_for', // Ensure immediate availability
      });
    } catch (error) {
      console.error(`Error indexing document in '${index}':`, error);
      throw error;
    }
  }

  /**
   * Deletes a document from an index by its ID.
   * @param index - Name of the index.
   * @param id    - ID of the document to delete.
   */
  public async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await this.client.delete({
        index,
        id,
        refresh: 'wait_for',
      });
    } catch (error) {
      console.error(`Error deleting document '${id}' in '${index}':`, error);
      throw error;
    }
  }

  /**
   * Performs bulk indexing of multiple documents in a single request.
   * Optimal for indexing large volumes of data.
   * @param index - Name of the OpenSearch index.
   * @param documents - Array of documents to index.
   */
  public async bulkIndex(index: string, documents: IndexDocument[]): Promise<void> {
    if (!documents?.length) return;

    const bulkBody = documents.flatMap((doc) => [
      { index: { _index: index, _id: doc.id } },
      doc.body,
    ]);

    try {
      const response = await this.client.bulk({
        refresh: 'wait_for',
        body: bulkBody,
      });

      if (response.body.errors) {
        // Filter out items that failed
        const erroredItems = response.body.items.filter((item: any) => item.index && item.index.error);
        console.error('Errors during bulk indexing:', erroredItems);
        throw new Error('Some bulk operations failed.');
      }
    } catch (error) {
      console.error('Error during bulk indexing:', error);
      throw error;
    }
  }

  /**
   * Executes a search query on a given index.
   * @param index - Name of the OpenSearch index.
   * @param query - OpenSearch DSL query object (e.g. { query: { match: { title: 'test' }}}).
   * @param from  - Pagination: start offset.
   * @param size  - Pagination: number of results to return.
   * @returns     - An array of documents matching the query.
   */
  public async search<T = any>(
    index: string,
    query: Record<string, any>,
    from: number = 0,
    size: number = 10
  ): Promise<T[]> {
    try {
      const response: ApiResponse = await this.client.search({
        index,
        body: {
          ...query,
          from,
          size,
        },
      });
      const hits = (response.body.hits?.hits || []) as Array<{ _source: T }>;
      return hits.map((h) => h._source);
    } catch (error) {
      console.error(`Error searching in index '${index}':`, error);
      throw error;
    }
  }

  /**
   * Retrieves the mapping definition for a given index.
   * @param index - Name of the OpenSearch index.
   * @returns     - The index's mapping as a JSON object.
   */
  public async getMapping(index: string): Promise<Record<string, any>> {
    try {
      const response = await this.client.indices.getMapping({ index });
      return response.body[index]?.mappings || {};
    } catch (error) {
      console.error(`Error retrieving mapping for index '${index}':`, error);
      throw error;
    }
  }

  /**
   * Updates the mapping of an existing index.
   * @param index   - Name of the OpenSearch index.
   * @param mapping - The mapping object to apply.
   */
  public async putMapping(index: string, mapping: Record<string, any>): Promise<void> {
    try {
      await this.client.indices.putMapping({
        index,
        body: mapping,
      });
      console.log(`Mapping successfully updated for index '${index}'.`);
    } catch (error) {
      console.error(`Error updating mapping for index '${index}':`, error);
      throw error;
    }
  }

  /**
   * Creates or updates an alias that points to one or more indices.
   * @param alias   - The alias name to create or update.
   * @param indices - Array of indices for this alias to point to.
   */
  public async createAlias(alias: string, indices: string[]): Promise<void> {
    try {
      // Build actions for each index
      const actions = indices.map((idx) => ({ add: { index: idx, alias } }));
      await this.client.indices.updateAliases({
        body: {
          actions,
        },
      });
      console.log(`Alias '${alias}' updated for indices: ${indices.join(', ')}.`);
    } catch (error) {
      console.error(`Error creating/updating alias '${alias}':`, error);
      throw error;
    }
  }

  /**
   * Performs a reindex operation from a source index to a destination index.
   * @param sourceIndex      - The source index.
   * @param destinationIndex - The destination index.
   * @param query            - Optional DSL query to filter documents during reindex.
   */
  public async reindex(
    sourceIndex: string,
    destinationIndex: string,
    query?: Record<string, any>
  ): Promise<void> {
    try {
      const body: RequestParams.Reindex['body'] = {
        source: { index: sourceIndex },
        dest: { index: destinationIndex },
      };
      if (query) {
        body.source.query = query;
      }

      const response = await this.client.reindex({ body, refresh: true, wait_for_completion: true });
      console.log(
        `Successfully reindexed from '${sourceIndex}' to '${destinationIndex}'.`,
        response.body
      );
    } catch (error) {
      console.error(`Error reindexing from '${sourceIndex}' to '${destinationIndex}':`, error);
      throw error;
    }
  }
}
