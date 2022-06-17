import { translateAddress } from "../address";

describe("translateAddress", () => {
  it("should translate address back and forth", () => {
    const originalAddress = "like1ewpwcdfgsdfdu0jj2unwhjjl58yshm9xnvr9c2";
    const translatedAddress = translateAddress(originalAddress, "secret");
    expect(translateAddress(translatedAddress, "like")).toBe(originalAddress);
  });
});
