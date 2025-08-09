"use client"

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="p-4 border rounded bg-red-50 text-red-700">
      <div className="font-medium">Import failed</div>
      <div className="text-sm">{error.message}</div>
    </div>
  )
}