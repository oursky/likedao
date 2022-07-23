const EMAIL_REGEX =
  /^$|^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateEmail(e: string): boolean {
  if (!e) {
    return false;
  }
  return EMAIL_REGEX.test(e);
}
