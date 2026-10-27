import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.hourly(
  "clean unattached photos",
  { minuteUTC: 15 },
  internal.maintenance.orphanMedia,
  {},
);
crons.hourly(
  "retry account cleanup",
  { minuteUTC: 30 },
  internal.accounts.retryClerk,
  {},
);
export default crons;
