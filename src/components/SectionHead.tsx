import Reveal from "./Reveal";

interface Props {
  index: string;
  label: string;
  title: string;
}

/** Shared section header: `[ 01 / LABEL ]` eyebrow + display title. */
export default function SectionHead({ index, label, title }: Props) {
  return (
    <Reveal className="section-head">
      <p className="section-label mono">
        <span className="grad-text">[</span> {index} / {label}{" "}
        <span className="grad-text">]</span>
      </p>
      <h2 className="section-title">{title}</h2>
    </Reveal>
  );
}
