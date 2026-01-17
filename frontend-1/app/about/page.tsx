export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      {/* Container */}
      <div className="mx-auto max-w-4xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            About <span className="text-primary">MemeHub</span>
          </h1>
          <p className="text-gray-600 text-lg">
            The internet’s playground for memes, creativity, and pure chaos.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            🚀 What is MemeHub?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            MemeHub is a community-driven meme sharing platform where humor meets
            creativity. Whether youre into dark humor, relatable content,
            programming jokes, or college memes — MemeHub is your home.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Feature
            title="🔥 Fresh Memes Daily"
            desc="Discover trending and top-rated memes updated in real time."
          />
          <Feature
            title="🎭 Categories for Everyone"
            desc="Funny, Dark, Relatable, Programming, College & more."
          />
          <Feature
            title="🏆 Meme Challenges"
            desc="Participate in monthly challenges and win exciting rewards."
          />
          <Feature
            title="🤝 Community First"
            desc="Follow creators, like memes, and grow together."
          />
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Ready to post your first meme?
          </h3>
          <p className="text-gray-600">
            Join MemeHub today and become part of the fun.
          </p>
          <button className="rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition">
            Start Sharing 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

/* Feature Card Component */
function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  )
}
