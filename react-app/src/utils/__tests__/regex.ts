import { validateEmail } from "../regex";

describe("validateEmail", () => {
  it("should fail empty email", () => {
    const email = "";

    expect(validateEmail(email)).toBe(false);
  });

  it("should fail invalid email", () => {
    const email = "invalid";

    expect(validateEmail(email)).toBe(false);
  });

  it("should pass valid email", () => {
    const email = "test@exmaple.com";

    expect(validateEmail(email)).toBe(true);
  });

  it("should pass valid email with plus", () => {
    const email = "test+2@example.com";

    expect(validateEmail(email)).toBe(true);
  });

  it("should pass valid email with dots", () => {
    const email = "test.hello.world@example.com";

    expect(validateEmail(email)).toBe(true);
  });
});
