export default function Support() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            MemeHub Support
          </h1>
          <p className="text-gray-600 text-lg">
            Need help? We’ve got you covered.
          </p>
        </div>

        {/* Quick Help */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SupportCard
            title="🚀 Getting Started"
            desc="Learn how to create an account, upload memes, and explore categories."
          />
          <SupportCard
            title="📤 Upload Issues"
            desc="Having trouble uploading memes or videos? Find common fixes here."
          />
          <SupportCard
            title="🚫 Report Content"
            desc="Report inappropriate or rule-breaking memes easily."
          />
          <SupportCard
            title="🔐 Account & Privacy"
            desc="Manage your account, privacy settings, and security."
          />
        </div>

        {/* FAQs */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-2xl font-semibold text-gray-900">
            ❓ Frequently Asked Questions
          </h2>

          <FAQ
            q="How do I upload a meme?"
            a="Click on the Upload button in the top navbar, select your file, choose a category, and post."
          />
          <FAQ
            q="Why was my meme removed?"
            a="Your meme may have violated our community rules or content guidelines."
          />
          <FAQ
            q="How can I report a meme?"
            a="Click the three dots on a meme post and select Report."
          />
          <FAQ
            q="Can I delete my account?"
            a="Yes, you can request account deletion from settings or contact support."
          />
        </div>

        {/* Contact */}
        <div className="rounded-2xl bg-purple-600 p-8 text-white space-y-4 text-center">
          <h2 className="text-2xl font-semibold">
            📩 Still Need Help?
          </h2>
          <p className="text-purple-100">
            Our support team is always here to help you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="rounded-full bg-white px-6 py-3 font-medium text-purple-600 hover:bg-gray-100 transition">
              Contact Support
            </button>
            <button className="rounded-full border border-white px-6 py-3 font-medium hover:bg-purple-700 transition">
              Report a Problem
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* Components */

function SupportCard({
  title,
  desc,
}: {
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  )
}

function FAQ({
  q,
  a,
}: {
  q: string
  a: string
}) {
  return (
    <div className="border-b last:border-none pb-4">
      <h4 className="font-semibold text-gray-900">{q}</h4>
      <p className="mt-1 text-gray-600">{a}</p>
    </div>
  )
}
