/** Fixed decorative layer: fine grid + drifting aurora glows, all CSS. */
export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-a" />
      <div className="bg-glow bg-glow-b" />
      <div className="bg-vignette" />
    </div>
  );
}
