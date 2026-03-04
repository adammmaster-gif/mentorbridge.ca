"use client";
import { format } from "date-fns";
import type { HourEntry } from "@/types";

interface Props {
  log: HourEntry[];
}

export default function HoursTable({ log }: Props) {
  return (
    <table className="ht">
      <thead>
        <tr><th>Date</th><th>Course</th><th>Student</th><th>Time</th><th>Status</th></tr>
      </thead>
      <tbody>
        {log.map((h, i) => (
          <tr key={i}>
            <td>{format(new Date(h.date), "MMM d")}</td>
            <td>{h.subject}</td>
            <td>{h.learnerName}</td>
            <td>{Math.floor(h.durationMinutes / 60)}h {h.durationMinutes % 60}m</td>
            <td>
              {h.status === "confirmed"
                ? <span className="bc">✓ Confirmed</span>
                : <span className="bp">⏳ Pending</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
