import { describe, it, expect, beforeEach } from "vitest";
import NLDParser from "src/parser";

describe("NLDParser.getParsedDate", () => {
  let parser: NLDParser;

  beforeEach(() => {
    parser = new NLDParser();
  });

  describe("YYYYMMDD 格式", () => {
    it("解析 20260302 為 2026-03-02", () => {
      const result = parser.getParsedDate("20260302", "locale-default");
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // 0-indexed
      expect(result.getDate()).toBe(2);
    });

    it("解析 20260101 為 2026-01-01", () => {
      const result = parser.getParsedDate("20260101", "locale-default");
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it("解析 20251231 為 2025-12-31", () => {
      const result = parser.getParsedDate("20251231", "locale-default");
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });

    it("無效月份 20261301 回傳 null（交給 chrono）", () => {
      // month=13 超出範圍，YYYYMMDD 守衛不處理，chrono 也無法解析
      const result = parser.getParsedDate("20261301", "locale-default");
      expect(result).toBeNull();
    });

    it("無效日期 20260200 回傳 null（交給 chrono）", () => {
      // day=0 超出範圍
      const result = parser.getParsedDate("20260200", "locale-default");
      expect(result).toBeNull();
    });
  });

  describe("自然語言日期", () => {
    it("解析 'today'", () => {
      const result = parser.getParsedDate("today", "locale-default");
      const today = new Date();
      expect(result.getFullYear()).toBe(today.getFullYear());
      expect(result.getMonth()).toBe(today.getMonth());
      expect(result.getDate()).toBe(today.getDate());
    });

    it("解析 'tomorrow'", () => {
      const result = parser.getParsedDate("tomorrow", "locale-default");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(result.getFullYear()).toBe(tomorrow.getFullYear());
      expect(result.getMonth()).toBe(tomorrow.getMonth());
      expect(result.getDate()).toBe(tomorrow.getDate());
    });

    it("解析 'yesterday'", () => {
      const result = parser.getParsedDate("yesterday", "locale-default");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(result.getFullYear()).toBe(yesterday.getFullYear());
      expect(result.getMonth()).toBe(yesterday.getMonth());
      expect(result.getDate()).toBe(yesterday.getDate());
    });

    it("解析 'in 3 days'", () => {
      const result = parser.getParsedDate("in 3 days", "locale-default");
      const expected = new Date();
      expected.setDate(expected.getDate() + 3);
      expect(result.getDate()).toBe(expected.getDate());
    });
  });

  describe("ISO 日期格式", () => {
    it("解析 '2026-03-15'", () => {
      const result = parser.getParsedDate("2026-03-15", "locale-default");
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });

    it("解析 'March 15, 2026'", () => {
      const result = parser.getParsedDate("March 15, 2026", "locale-default");
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });
  });

  describe("特殊日期", () => {
    it("解析 'Christmas' 為 12 月 25 日", () => {
      const result = parser.getParsedDate("Christmas", "locale-default");
      expect(result.getMonth()).toBe(11); // December, 0-indexed
      expect(result.getDate()).toBe(25);
    });

    it("解析 'last day of March' 為 3 月 31 日", () => {
      const result = parser.getParsedDate("last day of March", "locale-default");
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(31);
    });

    it("解析 'mid January' 為 1 月 15 日", () => {
      const result = parser.getParsedDate("mid January", "locale-default");
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });
});
