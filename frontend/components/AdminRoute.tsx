"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getUser();

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) return null;

  return <>{children}</>;
}