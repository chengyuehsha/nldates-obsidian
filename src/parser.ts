import chrono, { Chrono, Parser } from "chrono-node";
import type { Moment } from "moment";

import { DayOfWeek } from "./settings";
import {
  ORDINAL_NUMBER_PATTERN,
  getLastDayOfMonth,
  getLocaleWeekStart,
  getWeekNumber,
  parseOrdinalNumberPattern,
} from "./utils";

export interface NLDResult {
  formattedString: string;
  date: Date;
  moment: Moment;
}

function getLocalizedChrono(): Chrono {
  const locale = window.moment.locale();

  switch (locale) {
    case "en-gb":
      return new Chrono(chrono.en.createCasualConfiguration(true));
    default:
      return new Chrono(chrono.en.createCasualConfiguration(false));
  }
}

function getConfiguredChrono(): Chrono {
  const localizedChrono = getLocalizedChrono();
  localizedChrono.parsers.push({
    pattern: () => {
      return /\bChristmas\b/i;
    },
    extract: () => {
      return {
        day: 25,
        month: 12,
      };
    },
  });

  localizedChrono.parsers.push({
    pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN),
    extract: (_context, match) => {
      return {
        day: parseOrdinalNumberPattern(match[0]),
        month: window.moment().month(),
      };
    },
  } as Parser);

  // 支援 YYYYMMDD 格式（例如 20260101 → 2026-01-01）
  localizedChrono.parsers.push({
    pattern: () => /\b(\d{8})\b/,
    extract: (_context, match) => {
      const text = match[1];
      const year = parseInt(text.substring(0, 4));
      const month = parseInt(text.substring(4, 6));
      const day = parseInt(text.substring(6, 8));
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }
      return { year, month, day };
    },
  } as Parser);

  return localizedChrono;
}

export default class NLDParser {
  chrono: Chrono;

  constructor() {
    this.chrono = getConfiguredChrono();
  }

  getParsedDate(selectedText: string, weekStartPreference: DayOfWeek): Date {
    // YYYYMMDD 格式直接解析，不依賴 chrono parser 順序
    const yyyymmdd = selectedText.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (yyyymmdd) {
      const [, y, m, d] = yyyymmdd;
      const month = parseInt(m);
      const day = parseInt(d);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(parseInt(y), month - 1, day);
      }
    }

    const parser = this.chrono;
    const initialParse = parser.parse(selectedText);
    const weekdayIsCertain = initialParse[0]?.start.isCertain("weekday");

    const weekStart =
      weekStartPreference === "locale-default"
        ? getLocaleWeekStart()
        : weekStartPreference;

    const locale = {
      weekStart: getWeekNumber(weekStart),
    };

    const thisDateMatch = selectedText.match(/this\s([\w]+)/i);
    const nextDateMatch = selectedText.match(/next\s([\w]+)/i);
    const lastDayOfMatch = selectedText.match(/(last day of|end of)\s*([^\n\r]*)/i);
    const midOf = selectedText.match(/mid\s([\w]+)/i);

    const referenceDate = weekdayIsCertain
      ? window.moment().weekday(0).toDate()
      : new Date();

    if (thisDateMatch && thisDateMatch[1] === "week") {
      return parser.parseDate(`this ${weekStart}`, referenceDate);
    }

    if (nextDateMatch && nextDateMatch[1] === "week") {
      return parser.parseDate(`next ${weekStart}`, referenceDate, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "month") {
      const thisMonth = parser.parseDate("this month", new Date(), {
        forwardDate: true,
      });
      return parser.parseDate(selectedText, thisMonth, {
        forwardDate: true,
      });
    }

    if (nextDateMatch && nextDateMatch[1] === "year") {
      const thisYear = parser.parseDate("this year", new Date(), {
        forwardDate: true,
      });
      return parser.parseDate(selectedText, thisYear, {
        forwardDate: true,
      });
    }

    if (lastDayOfMatch) {
      const tempDate = parser.parse(lastDayOfMatch[2]);
      const year = tempDate[0].start.get("year");
      const month = tempDate[0].start.get("month");
      const lastDay = getLastDayOfMonth(year, month);

      return parser.parseDate(`${year}-${month}-${lastDay}`, new Date(), {
        forwardDate: true,
      });
    }

    if (midOf) {
      return parser.parseDate(`${midOf[1]} 15th`, new Date(), {
        forwardDate: true,
      });
    }

    return parser.parseDate(selectedText, referenceDate, { locale });
  }
}
