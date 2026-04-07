"use client";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            Privacy & <span className="text-primary">Community Policies</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Transparency, safety, and respect — the MemeHub way.
          </p>
        </div>

        {/* Privacy Policy */}
        <PolicyCard title="🔐 Privacy Policy">
          <p>
            At <b>MeemHub</b>, your privacy matters. This policy explains how we
            collect, use, and protect your information.
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>We collect basic account information (username, email).</li>
            <li>Your data is never sold to third parties.</li>
            <li>Memes you upload are public by default.</li>
            <li>You can delete your account any time.</li>
          </ul>
        </PolicyCard>

        {/* Content Rules */}
        <PolicyCard title="📜 Content Rules">
          <ul className="list-disc pl-5 space-y-2">
            <li>No hate speech, racism, or discrimination.</li>
            <li>No harassment or targeted abuse.</li>
            <li>No explicit sexual or illegal content.</li>
            <li>No misleading, scam, or spam posts.</li>
            <li>Respect copyright — post original or allowed content.</li>
          </ul>
        </PolicyCard>

        {/* Community Guidelines */}
        <PolicyCard title="🤝 Community Guidelines">
          <ul className="list-disc pl-5 space-y-2">
            <li>Be respectful — memes are for fun.</li>
            <li>Report harmful or rule-breaking content.</li>
            <li>Follow category guidelines when posting.</li>
          </ul>
        </PolicyCard>

        {/* Enforcement */}
        <PolicyCard title="⚠️ Rule Enforcement">
          <p>Violating MeemHub policies may result in:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Content removal</li>
            <li>Temporary account suspension</li>
            <li>Permanent ban for repeated violations</li>
          </ul>
        </PolicyCard>

        {/* Footer */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Ready to post your first meme?
          </h3>
          <p className="text-gray-600">
            Join MeemHub today and become part of the fun.
          </p>
          <button
            className="rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition"
            onClick={() => {
              router.push("/home");
            }}
          >
            Start Sharing 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable Card */
function PolicyCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
