/**
 * Filter options keyed by industry title (matches row `industry` / `industries[]` labels).
 * Always sourced from Industries API — never from table rows.
 */
export function buildIndustryFilterOptions(industries = []) {
  return (industries || [])
    .filter((industry) => industry?.title || industry?.id)
    .map((industry) => ({
      value: industry.title || industry.id,
      label: industry.title || industry.id,
    }));
}

/**
 * Form options keyed by industry UUID.
 */
export function buildIndustryFormOptions(industries = []) {
  return (industries || [])
    .filter((industry) => industry?.id)
    .map((industry) => ({
      value: industry.id,
      label: industry.title || industry.id,
    }));
}
