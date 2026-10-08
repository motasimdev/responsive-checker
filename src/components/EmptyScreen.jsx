// Shown inside the device screen in Public URL mode before anything is loaded. Sized in em with
// a counter-scaled font so it stays readable however far the device is shrunk.
export default function EmptyScreen({ scale }) {
  return (
    <div
      className="grid h-full w-full place-items-center bg-zinc-50 p-[2em] text-center text-zinc-500"
      style={{ fontSize: `${Math.round(14 / scale)}px` }}
    >
      <div>
        <p className="font-semibold text-zinc-800">No page loaded</p>
        <p className="mt-[0.5em]">
          Enter a public website address above, for example <span className="font-mono">https://example.com</span>, then press Enter.
        </p>
      </div>
    </div>
  )
}
