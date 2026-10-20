import {
  setCookie,
  getCookie,
  delCookie,
  listCookies,
  purgeExpired,
  ClearCookies,
} from "./ReactCookie";

// ============================================
// Setup
// ============================================
beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

// ============================================
// setCookie + getCookie: round-trip
// ============================================
describe("setCookie / getCookie", () => {
  it("stores and retrieves a string value", () => {
    setCookie({ name: "theme", value: "dark", time: 3600 });
    expect(getCookie<string>("theme")).toBe("dark");
  });

  it("stores and retrieves an object value", () => {
    const prefs = { theme: "light", fontSize: 14 };
    setCookie({ name: "prefs", value: prefs, time: 3600 });
    expect(getCookie<typeof prefs>("prefs")).toEqual(prefs);
  });

  it("updates an existing cookie in place", () => {
    setCookie({ name: "counter", value: 1, time: 3600 });
    setCookie({ name: "counter", value: 2, time: 3600 });
    expect(getCookie<number>("counter")).toBe(2);
    expect(listCookies()).toHaveLength(1);
  });

  it("returns null for a missing cookie", () => {
    expect(getCookie("does-not-exist")).toBeNull();
  });

  it("ignores empty name", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    setCookie({ name: "", value: "x" });
    expect(spy).toHaveBeenCalled();
    expect(getCookie("")).toBeNull();
  });

  it("applies default time (60s) when not provided", () => {
    setCookie({ name: "no-time", value: "v" });
    const list = listCookies();
    expect(list[0].time).toBe(60);
  });
});

// ============================================
// Expiration + purgeExpired
// ============================================
describe("expiration", () => {
  it("treats an expired cookie as null on getCookie", () => {
    // time = 0 => expiry == created_at => منتهي فوراً
    setCookie({ name: "temp", value: "x", time: 0 });
    expect(getCookie("temp")).toBeNull();
  });

  it("purgeExpired removes only expired entries", () => {
    setCookie({ name: "alive", value: "a", time: 3600 });
    setCookie({ name: "dead", value: "d", time: 0 });

    const removed = purgeExpired();
    expect(removed).toBe(1);

    const remaining = listCookies();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("alive");
  });

  it("purgeExpired returns 0 when nothing is expired", () => {
    setCookie({ name: "a", value: 1, time: 3600 });
    setCookie({ name: "b", value: 2, time: 3600 });
    expect(purgeExpired()).toBe(0);
  });
});

// ============================================
// delCookie
// ============================================
describe("delCookie", () => {
  it("removes the specified cookie", () => {
    setCookie({ name: "a", value: 1, time: 3600 });
    setCookie({ name: "b", value: 2, time: 3600 });

    delCookie({ name: "a" });

    expect(getCookie("a")).toBeNull();
    expect(getCookie("b")).toBe(2);
  });

  it("is a no-op for missing cookies", () => {
    delCookie({ name: "nope" });
    expect(listCookies()).toHaveLength(0);
  });
});

// ============================================
// listCookies shape
// ============================================
describe("listCookies", () => {
  it("returns the documented CookieListItem shape", () => {
    setCookie({ name: "theme", value: "dark", time: 3600 });
    const [item] = listCookies();

    expect(item).toMatchObject({
      name: "theme",
      value: "dark",
      time: 3600,
    });
    expect(item.created_at).toBeInstanceOf(Date);
    expect(item.expires_at).toBeInstanceOf(Date);
    expect(item.expires_at.getTime()).toBeGreaterThan(
      item.created_at.getTime()
    );
  });

  it("excludes expired entries", () => {
    setCookie({ name: "a", value: 1, time: 3600 });
    setCookie({ name: "b", value: 2, time: 0 });
    const names = listCookies().map((c) => c.name);
    expect(names).toEqual(["a"]);
  });
});

// ============================================
// ClearCookies
// ============================================
describe("ClearCookies", () => {
  it("removes every cookie", () => {
    setCookie({ name: "a", value: 1, time: 3600 });
    setCookie({ name: "b", value: 2, time: 3600 });
    ClearCookies();
    expect(listCookies()).toHaveLength(0);
  });
});

// ============================================
// Corrupted storage handling
// ============================================
describe("robustness", () => {
  it("returns empty list when localStorage holds invalid JSON", () => {
    localStorage.setItem("AllLocals", "{ not valid json ");
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(listCookies()).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });
});

// ============================================
// useSyncCookie (hook)
// ============================================
import { renderHook, act } from "@testing-library/react";
import { useSyncCookie } from "./ReactCookie";

describe("useSyncCookie", () => {
  it("returns the current cookie value on mount", () => {
    setCookie({ name: "theme", value: "dark", time: 3600 });
    const { result } = renderHook(() => useSyncCookie<string>("theme"));
    expect(result.current).toBe("dark");
  });

  it("updates when a storage_update event fires", () => {
    const { result } = renderHook(() => useSyncCookie<string>("theme"));
    expect(result.current).toBeNull();

    act(() => {
      setCookie({ name: "theme", value: "light", time: 3600 });
    });

    expect(result.current).toBe("light");
  });

  it("returns null for a missing cookie", () => {
    const { result } = renderHook(() => useSyncCookie("ghost"));
    expect(result.current).toBeNull();
  });
});
