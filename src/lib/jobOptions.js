/**
 * Filter/form options for Jobs — always from Jobs API.
 */
export function buildJobFilterOptions(jobs = []) {
  return (jobs || [])
    .filter((job) => job?.id && job?.title)
    .map((job) => ({
      value: job.id,
      label: job.title,
    }));
}
