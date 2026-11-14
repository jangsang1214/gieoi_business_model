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
    "/a/..//evil.example",
    "/a/%2e%2e//evil.example",
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

test("the final auth redirect always stays on the application origin", () => {
  const origin = "https://prof.example";
  for (const path of ["/a/..//evil.example", "/a/%2e%2e//evil.example", "/profile?next=https://evil.example"]) {
    assert.equal(new URL(safeNextPath(path), origin).origin, origin);
  }
});
