/** Display code used in list rows when API company === "group" */
export const GROUP_CODE = "TEG";

/** API value for Tamimi Energy Group (Jobs, Certificates, Downloads) */
export const GROUP_VALUE = "group";

/**
 * Filter options keyed by shortCode (matches row `company_code` / `holder_code`).
 * Always sourced from Companies API — never from table rows.
 */
export function buildCompanyFilterOptions(
  companies = [],
  { includeGroup = false } = {}
) {
  const options = (companies || [])
    .filter((company) => company?.code || company?.title)
    .map((company) => ({
      value: company.code || company.id,
      label: company.code
        ? `${company.code} — ${company.title || ""}`.trim()
        : company.title || company.id,
    }));

  if (!includeGroup) return options;

  return [
    { value: GROUP_CODE, label: "Tamimi Energy Group" },
    ...options,
  ];
}

/**
 * Form options keyed by company UUID (and optional `group` / None).
 * Always sourced from Companies API.
 */
export function buildCompanyFormOptions(
  companies = [],
  { includeGroup = false, includeNone = false } = {}
) {
  const options = (companies || [])
    .filter((company) => company?.id)
    .map((company) => ({
      value: company.id,
      label: company.code
        ? `${company.code} — ${company.title || "Untitled"}`
        : company.title || company.id,
    }));

  const prefix = [];
  if (includeNone) prefix.push({ value: "", label: "None" });
  if (includeGroup) {
    prefix.push({ value: GROUP_VALUE, label: "Tamimi Energy Group" });
  }
  return [...prefix, ...options];
}

/** Logo / label lookup map from API companies (+ optional TEG group entry). */
export function buildCompaniesByCode(
  companies = [],
  { includeGroup = false } = {}
) {
  const map = {};
  if (includeGroup) {
    map[GROUP_CODE] = {
      code: GROUP_CODE,
      title: "Tamimi Energy Group",
      image: "/images/logo.png",
    };
  }
  (companies || []).forEach((company) => {
    if (company?.code) map[company.code] = company;
  });
  return map;
}
