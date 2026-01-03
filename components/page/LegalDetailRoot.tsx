"use client";

import { useRouter } from "next/navigation";
import type { BlogPost } from "./BlogDetail";
import LegalDetail from "./LegalDetail";

interface Props {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export function LegalDetailRoot({ post, relatedPosts }: Props) {
  const router = useRouter();
  return <LegalDetail post={post} related={relatedPosts} />;
}
