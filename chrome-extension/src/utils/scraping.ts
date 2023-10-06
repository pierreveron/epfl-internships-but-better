export async function scrapeJobs(callback: (text: string) => void) {
  const jobsIds = Array.from(document.querySelectorAll("[id^='stage_']")).map((e) => e.id.split('_')[2])
  console.log(jobsIds)
  return jobsIds
}
