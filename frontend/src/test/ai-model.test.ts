import { describe, it, expect } from "vitest";

// Utility helpers extracted from AI feature components

/**
 * Parses streamed SSE data lines and accumulates AI response content.
 */
function accumulateSSEContent(lines: string[]): string {
  let full = "";
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const json = line.slice(6).trim();
    if (json === "[DONE]") break;
    try {
      const parsed = JSON.parse(json);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) full += content;
    } catch {
      // ignore parse errors
    }
  }
  return full;
}

/**
 * Calculates a basic rule-based job match score.
 */
function calcJobMatchScore(userSkills: string[], jobSkillsRequired: string[]): number {
  if (!userSkills.length || !jobSkillsRequired.length) return 0;
  const lower = (s: string) => s.toLowerCase();
  const matched = jobSkillsRequired.filter(s =>
    userSkills.some(us => lower(us).includes(lower(s)) || lower(s).includes(lower(us)))
  );
  return Math.round((matched.length / jobSkillsRequired.length) * 100);
}

/**
 * Checks basic rule-based scheme eligibility.
 */
function checkSchemeEligibility(
  profile: { disability_type?: string; income?: number; education_level?: string },
  scheme: { disability_types?: string[]; max_income?: number; education_required?: string }
): { eligible: boolean; score: number } {
  let score = 0;
  let checks = 0;

  if (scheme.disability_types?.length) {
    checks++;
    if (
      scheme.disability_types.includes(profile.disability_type ?? "") ||
      scheme.disability_types.includes("Any")
    ) score++;
  }
  if (scheme.max_income && scheme.max_income > 0) {
    checks++;
    if (!profile.income || profile.income <= scheme.max_income) score++;
  }
  if (scheme.education_required && scheme.education_required !== "Any") {
    checks++;
    if (profile.education_level) score++;
  }
  checks = Math.max(checks, 1);
  return { eligible: score === checks, score: Math.round((score / checks) * 100) };
}

describe("AI model utilities", () => {
  describe("accumulateSSEContent", () => {
    it("accumulates content from valid SSE lines", () => {
      const lines = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}',
        'data: {"choices":[{"delta":{"content":" World"}}]}',
        "data: [DONE]",
      ];
      expect(accumulateSSEContent(lines)).toBe("Hello World");
    });

    it("stops at [DONE]", () => {
      const lines = [
        'data: {"choices":[{"delta":{"content":"part1"}}]}',
        "data: [DONE]",
        'data: {"choices":[{"delta":{"content":"part2"}}]}',
      ];
      expect(accumulateSSEContent(lines)).toBe("part1");
    });

    it("ignores lines not starting with data:", () => {
      const lines = [
        "event: message",
        'data: {"choices":[{"delta":{"content":"valid"}}]}',
        ": keep-alive",
      ];
      expect(accumulateSSEContent(lines)).toBe("valid");
    });

    it("handles empty content delta gracefully", () => {
      const lines = [
        'data: {"choices":[{"delta":{}}]}',
        'data: {"choices":[{"delta":{"content":"ok"}}]}',
      ];
      expect(accumulateSSEContent(lines)).toBe("ok");
    });
  });

  describe("calcJobMatchScore", () => {
    it("returns 100 when all required skills match", () => {
      expect(calcJobMatchScore(["React", "TypeScript", "CSS"], ["React", "TypeScript"])).toBe(100);
    });

    it("returns 50 when half of required skills match", () => {
      expect(calcJobMatchScore(["React"], ["React", "TypeScript"])).toBe(50);
    });

    it("returns 0 when user has no skills", () => {
      expect(calcJobMatchScore([], ["React", "TypeScript"])).toBe(0);
    });

    it("returns 0 when job has no required skills", () => {
      expect(calcJobMatchScore(["React"], [])).toBe(0);
    });

    it("performs case-insensitive matching", () => {
      expect(calcJobMatchScore(["react"], ["React"])).toBe(100);
    });
  });

  describe("checkSchemeEligibility", () => {
    it("marks eligible when disability type matches", () => {
      const result = checkSchemeEligibility(
        { disability_type: "Visual" },
        { disability_types: ["Visual", "Hearing"] }
      );
      expect(result.eligible).toBe(true);
      expect(result.score).toBe(100);
    });

    it("marks eligible when scheme accepts Any disability", () => {
      const result = checkSchemeEligibility(
        { disability_type: "Physical" },
        { disability_types: ["Any"] }
      );
      expect(result.eligible).toBe(true);
    });

    it("marks ineligible when disability type does not match", () => {
      const result = checkSchemeEligibility(
        { disability_type: "Speech" },
        { disability_types: ["Visual", "Hearing"] }
      );
      expect(result.eligible).toBe(false);
    });

    it("marks eligible when income is within limit", () => {
      const result = checkSchemeEligibility(
        { income: 200000 },
        { max_income: 500000 }
      );
      expect(result.eligible).toBe(true);
      expect(result.score).toBe(100);
    });

    it("marks eligible when income is not specified by user", () => {
      const result = checkSchemeEligibility(
        {},
        { max_income: 500000 }
      );
      expect(result.eligible).toBe(true);
    });
  });
});
