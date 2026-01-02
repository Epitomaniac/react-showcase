import { useState } from "react";

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    setLikes(prev => prev + 1);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }
    } catch {
      // Rollback is relative, not absolute
      setLikes(prev => prev - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* disabled={loading prevent race conditions so abort controller is not necessary */}
      <button onClick={handleLike} disabled={loading}>
        ❤️ {likes}
      </button>
    </>
  );
}

export default LikeButton;
