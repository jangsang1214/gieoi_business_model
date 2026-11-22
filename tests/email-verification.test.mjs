import test from "node:test";
import assert from "node:assert/strict";
import { canResendConfirmation, isSixDigitEmailCode } from "../src/lib/email-verification.ts";

test("only exact 6 ASCII digits count as an email code", () => {
  for (const code of ["000001", "123456", "987654"]) assert.equal(isSixDigitEmailCode(code), true);
  for (const code of ["12345", "1234567", "123 456", "1234ab", "１２３４５６", ""]) {
    assert.equal(isSixDigitEmailCode(code), false);
  }
});

test("requires a 60-second gap between confirmation email requests", () => {
  assert.equal(canResendConfirmation(0, 1234), true);
  assert.equal(canResendConfirmation(1000, 1000), false);
  assert.equal(canResendConfirmation(1000, 60999), false);
  assert.equal(canResendConfirmation(1000, 61000), true);
});
