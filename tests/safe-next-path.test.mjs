import test from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../src/lib/safe-next-path.ts";

test("allows only valid local destinations", () => {
  assert.equal(safeNextPath("/"), "/");
  assert.equal(safeNextPath("/reset-password"), "/reset-password");
  assert.equal(safeNextPath("/profile?tab=proof#recent"), "/profile?tab=proof#recent");
  assert.equal(safeNextPath(undefined, "/login"), "/login");
});

test("blocks phishing redirects from auth email links", () => {
  const invalid = [
    "//evil.example",
    "https://evil.example/login",
    "javascript:alert(1)",
    "/\\evil.example",
    "/about\nSet-Cookie: bad",
    "",
  ];
  for (const path of invalid) {
    assert.equal(safeNextPath(path), "/", `Expected to reject ${JSON.stringify(path)}`);
  }
});
