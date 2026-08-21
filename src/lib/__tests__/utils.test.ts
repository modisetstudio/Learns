import { describe, it, expect } from "vitest";

import { cn, formatDuration, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatDuration", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(4200)).toBe("70:00");
    expect(formatDuration(0)).toBe("00:00");
  });
});

describe("getInitials", () => {
  it("returns initials from first and last name", () => {
    expect(getInitials("Jan Novák")).toBe("JN");
  });

  it("handles a single name", () => {
    expect(getInitials("Kateřina")).toBe("K");
  });
});
