const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

export const buildExamBlueprint = (portalData) => {
  const sections = portalData?.exam?.sections;
  if (!sections) return [];

  return Object.entries(sections)
    .map(([name, score]) => {
      const numericScore = clamp(toNumber(score), 0, 15);
      const scorePercent = Math.round((numericScore / 15) * 100);
      const weeklyHours =
        scorePercent >= 80 ? 1 : scorePercent >= 60 ? 2 : scorePercent >= 40 ? 3 : 4;

      return {
        name,
        score: numericScore,
        scorePercent,
        weeklyHours,
        priority:
          scorePercent >= 80 ? "Maintain" : scorePercent >= 60 ? "Improve" : "Critical",
      };
    })
    .sort((a, b) => a.score - b.score);
};
