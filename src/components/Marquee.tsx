import { Fragment } from "react";

/** Seamless infinite ticker. Items are duplicated so a -50% loop is gapless. */
export default function Marquee({
  items,
  duration = "30s",
  reverse = false,
  invert = false
}: {
  items: string[];
  duration?: string;
  reverse?: boolean;
  invert?: boolean;
}) {
  const set = [...items, ...items];
  return (
    <div
      className={`marquee ${invert ? "invert" : ""} ${reverse ? "reverse" : ""}`}
      style={{ ["--mq-duration" as string]: duration }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {set.map((item, i) => (
          <Fragment key={i}>
            <span className="marquee-item">
              {item}
              <span className="dot">✦</span>
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
