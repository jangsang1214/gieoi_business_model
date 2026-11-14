import test from "node:test";
import assert from "node:assert/strict";
import { recordReactions } from "../src/lib/record-reactions.ts";

test("popular records retain exact totals and the viewer's reaction past the row cap", async () => {
  const rows = Array.from({ length: 1501 }, (_, i) => ({ record_id: "post", user_id: `user-${i}` }));
  const client = { from(table) {
    assert.equal(table, "record_likes");
    let matches = rows;
    let options;
    return {
      select(_columns, opts) { options = opts; return this; },
      eq(column, value) { matches = matches.filter(row => row[column] === value); return this; },
      maybeSingle() { return Promise.resolve({ data: matches[0] ?? null, error: null }); },
      then(resolve) { return Promise.resolve({ data: options?.head ? null : matches.slice(0, 1000), count: options?.count === "exact" ? matches.length : null, error: null }).then(resolve); },
    };
  } };
  const result = (await recordReactions(client, ["post"], "user-1500")).get("post");
  assert.equal(result.count, 1501);
  assert.equal(result.liked, true);
  assert.equal(result.unavailable, false);
});

test("query failures disable reactions instead of inventing an unliked state", async () => {
  const client = { from() { return {
    select() { return this; }, eq() { return this; },
    maybeSingle() { return Promise.resolve({ data: null, error: { message: "unavailable" } }); },
    then(resolve) { return Promise.resolve({ count: null, error: { message: "unavailable" } }).then(resolve); },
  }; } };
  assert.equal((await recordReactions(client, ["post"], "viewer")).get("post").unavailable, true);
  assert.equal((await recordReactions(client, [], "viewer")).size, 0);
});
