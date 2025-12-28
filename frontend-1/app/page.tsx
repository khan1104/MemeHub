"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const token=true;

    if (token) {
      router.replace("/home");
    } else {
      router.replace("/sign-in");
    }
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Loading...</h2>
    </div>
  );
}
