import { db, ContentRepository, SchemaBuilder } from '@volqan/core';

/** Shared singletons for content operations across API routes. */
export const schemaBuilder = new SchemaBuilder(db);
export const contentRepo = new ContentRepository(db, schemaBuilder);
