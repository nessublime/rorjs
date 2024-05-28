import {
  allResults,
  err,
  ok,
  Result,
  tryAllResults,
  anyResults,
} from "../../src";

class BaseError extends Error {}

describe("Result test", () => {
  describe("Test all", () => {
    it("Should all and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = ok(["hello"]);

      const r = allResults(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const [a, b] = r.getValue();

        expect(a).toBe(1);
        expect(b[0]).toBe("hello");
      }
    });

    it("Should all with Ok and Error and return Error", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = err(new Error("2"));

      const r = allResults(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.message).toBe("2");
      }
    });

    it("Should all with Error and Error and return Error", () => {
      const r1: Result<number, BaseError> = err(new BaseError("1"));
      const r2: Result<string[], Error> = err(new Error("2"));

      const r = allResults(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.message).toBe("1");
      }
    });
  });
  describe("Test tryAll", () => {
    it("Should tryAll and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = ok(["hello"]);

      const r = tryAllResults(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const [a, b] = r.getValue();

        expect(a).toBe(1);
        expect(b[0]).toBe("hello");
      }
    });

    it("Should tryAll with Ok and Error and return Error", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = err(new Error("Error"));

      const r = tryAllResults(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        const [a, b] = err;

        expect(err.length).toBe(2);
        expect(a.isNone()).toBeTruthy();
        expect(b.isSome()).toBeTruthy();
      }
    });

    it("Should tryAll with Error and Error and return Error", () => {
      const r1: Result<number, BaseError> = err(new BaseError("Error"));
      const r2: Result<string[], Error> = err(new Error("Error"));

      const r = tryAllResults(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        const [a, b] = err;

        expect(err.length).toBe(2);
        expect(a.isSome()).toBeTruthy();
        expect(b.isSome()).toBeTruthy();
      }
    });
  });
  describe("Test tryAny", () => {
    it("Should tryAny and return OK", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = ok(["hello"]);

      const r = anyResults(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("Should tryAny with Ok and Error and return Ok", () => {
      const r1: Result<number, BaseError> = ok(1);
      const r2: Result<string[], Error> = err(new Error("2"));

      const r = anyResults(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(1);
      }
    });

    it("Should tryAny with Error and Ok and return Ok", () => {
      const r1: Result<string[], Error> = err(new Error("1"));
      const r2: Result<number, BaseError> = ok(2);

      const r = anyResults(r1, r2);

      expect(r.isOk()).toBeTruthy();
      if (r.isOk()) {
        const val = r.getValue();

        expect(val).toBe(2);
      }
    });

    it("Should tryAny with Error and Error and return Error", () => {
      const r1: Result<number, BaseError> = err(new BaseError("1"));
      const r2: Result<string[], Error> = err(new Error("2"));

      const r = anyResults(r1, r2);

      expect(r.isErr()).toBeTruthy();
      if (r.isErr()) {
        const err = r.getErr();
        expect(err.length).toBe(2);
      }
    });
  });
});
