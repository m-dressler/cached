# @md/cached

Small utility to cache results of async operations

## Example

```
import cached from "@md/cached";

/** This will wrap the provided function to cache the result for 10 seconds */
const getRemoteFile = cached(async (name: string) => {
  const response = await fetch("https://example.com/" + name);
  return response.text();
}, 10_000);

await getRemoteFile("hello"); // Requests the file
await getRemoteFile("hello"); // Uses the cache instead
await getRemoteFile("world"); // Requests a different file
await new Promise(r=>setTimeout(r, 11_000)); // Let cache expire
await getRemoteFile("world"); // Requests the file again as the cache has become stale
```