/**
 * Serialize a DB record for Zod/OpenAPI response parsing.
 * Converts Date fields to ISO strings so generated Zod schemas (type: string) accept them.
 */
export function serialize<T>(record: T): T {
  return JSON.parse(JSON.stringify(record));
}
