import objectHash from "object-hash";

/** The internal cache used to store results of previously requested operations */
export type Cache<T extends (...args: unknown[]) => Promise<unknown>> = {
  [argumentsHash: string]: {
    /** The last time the request was made */
    lastUpdated: number;
    /** The last result or currently pending request */
    lastResult: ReturnType<T>;
  };
};

/**
 * Thin wrapper around a request function to cache the result for a certain amount of time
 * 
 * @example
 * ```ts
 * import cached from "@md/cached";
 * 
 * // This will wrap the provided function to cache the result for 10 seconds
 * const getRemoteFile = cached(async (name: string) => {
 *   const response = await fetch("https://example.com/" + name);
 *   return response.text();
 * }, 10_000);
 * 
 * await getRemoteFile("hello"); // Requests the file
 * await getRemoteFile("hello"); // Uses the cache instead
 * await getRemoteFile("world"); // Requests a different file
 * await new Promise(r=>setTimeout(r, 11_000)); // Let cache expire
 * await getRemoteFile("world"); // Requests the file again as the cache has become stale
 * ```
 * 
 * @param request The request to cache
 * @param cacheMs The amount of time in milliseconds until the cache becomes state
 * @returns A cached version of {@link request}
 */
// deno-lint-ignore no-explicit-any
export default function cached<T extends (...args: any[]) => Promise<any>>(
  request: T,
  cacheMs: number
): T & { invalidate: () => void } {
  /** The cache for this request */
  let cache: Cache<T> = {};

  const requestCached = ((...args: Parameters<T>): ReturnType<T> => {
    /** The unique SHA-1 hash for the arguments provided */
    const hash = args.length ? objectHash(args) : 0;
    /** Return the cached result for the  */
    const cached = cache[hash];

    // If the cache is not stale return the last result or currently pending request
    if (cached && cached.lastUpdated + cacheMs > Date.now())
      return cached.lastResult;

    // If there is no cached value or it's stale, send a new request
    const currentRequest = request(...args) as ReturnType<T>;
    cache[hash] = { lastUpdated: Date.now(), lastResult: currentRequest };
    return currentRequest;
  }) as unknown as T;

  /** Clears the entire cache */
  const invalidate = () => void (cache = {});

  return Object.assign(requestCached, { invalidate });
}
