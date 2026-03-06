import { describe, it, expect } from "vitest";
import { generateMarkdownLink, getFormattedDate, getLastDayOfMonth } from "src/utils";
import { App } from "obsidian";

function createMockApp(useMarkdownLinks = false): App {
  return {
    vault: {
      getConfig: (key: string) => {
        if (key === "useMarkdownLinks") return useMarkdownLinks;
        return undefined;
      },
    },
  } as unknown as App;
}

describe("generateMarkdownLink", () => {
  describe("wikilink 模式（預設）", () => {
    it("產生短格式 wikilink", () => {
      const app = createMockApp(false);
      expect(generateMarkdownLink(app, "2026-03-06")).toBe("[[2026-03-06]]");
    });

    it("帶 alias 的 wikilink", () => {
      const app = createMockApp(false);
      expect(generateMarkdownLink(app, "2026-03-06", "today")).toBe(
        "[[2026-03-06|today]]"
      );
    });

    it("不自動加 folder 前綴", () => {
      const app = createMockApp(false);
      const result = generateMarkdownLink(app, "2026-03-06");
      expect(result).not.toContain("Journal/");
    });
  });

  describe("markdown link 模式", () => {
    it("產生 markdown link", () => {
      const app = createMockApp(true);
      expect(generateMarkdownLink(app, "2026-03-06")).toBe(
        "[2026-03-06](2026-03-06)"
      );
    });

    it("帶 alias 的 markdown link", () => {
      const app = createMockApp(true);
      expect(generateMarkdownLink(app, "2026-03-06", "today")).toBe(
        "[today](2026-03-06)"
      );
    });

    it("空格被轉為 %20", () => {
      const app = createMockApp(true);
      expect(generateMarkdownLink(app, "March 6 2026", "today")).toBe(
        "[today](March%206%202026)"
      );
    });
  });
});

describe("getFormattedDate", () => {
  it("格式化日期為 YYYY-MM-DD", () => {
    const date = new Date(2026, 2, 6); // March 6, 2026
    expect(getFormattedDate(date, "YYYY-MM-DD")).toBe("2026-03-06");
  });

  it("格式化日期為 DD/MM/YYYY", () => {
    const date = new Date(2026, 0, 15); // January 15, 2026
    expect(getFormattedDate(date, "DD/MM/YYYY")).toBe("15/01/2026");
  });
});

describe("getLastDayOfMonth", () => {
  it("一月有 31 天", () => {
    expect(getLastDayOfMonth(2026, 1)).toBe(31);
  });

  it("二月平年 28 天", () => {
    expect(getLastDayOfMonth(2026, 2)).toBe(28);
  });

  it("二月閏年 29 天", () => {
    expect(getLastDayOfMonth(2024, 2)).toBe(29);
  });

  it("四月有 30 天", () => {
    expect(getLastDayOfMonth(2026, 4)).toBe(30);
  });
});
