import test from "node:test";
import assert from "node:assert/strict";
import { personDiscoveryReason } from "../src/lib/person-discovery-reason.ts";

test("shows a real shared interest, not a fabricated score", () => {
  assert.equal(personDiscoveryReason(["workout"], ["business", "workout"], false, "ko"), "공통 관심 분야 · WORKOUT");
  assert.equal(personDiscoveryReason(["workout"], ["WORKOUT"], false, "en"), "Shared interest · WORKOUT");
});
test("uses follow relationship only when no shared interest exists", () => {
  assert.equal(personDiscoveryReason([], ["business"], true, "ko"), "팔로우 중");
});
test("never claims compatibility for incomplete profiles", () => {
  assert.equal(personDiscoveryReason([], [], false, "ko"), "새로운 사람");
  assert.equal(personDiscoveryReason([], ["study"], false, "en"), "Interested in STUDY");
});
