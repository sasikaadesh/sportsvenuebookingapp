export default function PayHereReturn() {
  return (
    <main className="min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Payment Completed</h1>
      <p className="text-gray-700 mb-3">Thanks! If this was the sandbox, PayHere redirected you back here after processing.</p>
      <p className="text-gray-600">The final status is verified by our server at the notify_url and should be reflected in your backend logs or booking record.</p>
    </main>
  )
}

