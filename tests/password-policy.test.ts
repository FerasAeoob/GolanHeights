import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const {
  changePasswordSchema,
  registerSchema,
  resetPasswordSchema,
} = createRequire(import.meta.url)(
  "../database/user/user.schema.ts",
) as typeof import("../database/user/user.schema");

test("accepts passwords without special characters in every creation flow", () => {
  assert.equal(
    registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Password1",
      acceptTerms: true,
    }).success,
    true,
  );

  assert.equal(
    resetPasswordSchema.safeParse({
      token: "reset-token",
      password: "Password1",
      confirmPassword: "Password1",
    }).success,
    true,
  );

  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "Password1",
      confirmPassword: "Password1",
    }).success,
    true,
  );
});

test("keeps the remaining password requirements", () => {
  const invalidPasswords = [
    "Pass1",
    "password1",
    "PASSWORD1",
    "Password",
    `${"A".repeat(71)}a1`,
  ];

  for (const password of invalidPasswords) {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password,
      acceptTerms: true,
    });

    assert.equal(result.success, false, `expected ${password} to be rejected`);
  }
});
