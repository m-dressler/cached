import { assertEquals } from "jsr:@std/assert/equals";
import cached from "./mod.ts";

const wait = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

Deno.test("Caches value", async () => {
  let requestsMade = 0;
  const requester = () => Promise.resolve(++requestsMade);
  const cachedRequester = cached(requester, Infinity);
  assertEquals(await cachedRequester(), 1);
  assertEquals(await cachedRequester(), 1);
  assertEquals(await cachedRequester(), 1);
});

Deno.test("Updates value after cache expired", async () => {
  let requestsMade = 0;
  const requester = () => Promise.resolve(++requestsMade);
  const cachedRequester = cached(requester, 500);
  assertEquals(await cachedRequester(), 1);
  await wait(1_000);
  assertEquals(await cachedRequester(), 2);
  assertEquals(await cachedRequester(), 2);
});

Deno.test("Caches different arguments separately", async () => {
  let requestsMade = 0;
  const requester = (_: number) => Promise.resolve(++requestsMade);
  const cachedRequester = cached(requester, Infinity);
  assertEquals(await cachedRequester(1), 1);
  assertEquals(await cachedRequester(2), 2);
});

Deno.test("Caches equivalent arguments as same", async () => {
  let requestsMade = 0;
  const requester = (_: object) => Promise.resolve(++requestsMade);
  const cachedRequester = cached(requester, Infinity);
  assertEquals(await cachedRequester({}), 1);
  assertEquals(await cachedRequester({}), 1);
});

Deno.test("Invalidate function clears cache", async () => {
  let requestsMade = 0;
  const requester = (_: object) => Promise.resolve(++requestsMade);
  const cachedRequester = cached(requester, Infinity);
  assertEquals(await cachedRequester({}), 1);
  cachedRequester.invalidate();
  assertEquals(await cachedRequester({}), 2);
});
