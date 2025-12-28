import PostCard from "@/components/MemeCard"

interface PageProps {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PageProps) {
  const post = await fetch(
    `${process.env.API_URL}/posts/${params.id}`,
    { cache: "no-store" }
  ).then(res => res.json())

  const comments = await fetch(
    `${process.env.API_URL}/posts/${params.id}/comments`,
    { cache: "no-store" }
  ).then(res => res.json())

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <PostCard post={post} />

      <CommentsSection
        postId={params.id}
        comments={comments}
      />
    </div>
  )
}
