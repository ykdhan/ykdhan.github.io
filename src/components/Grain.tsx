/** Fixed full-screen texture overlays: film grain, scanlines, vignette. */
export default function Grain() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  );
}
