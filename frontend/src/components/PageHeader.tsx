"use client";

import { useRouter } from "next/navigation";

import { BackIcon } from "./ui";

/** Alt ekranların başlığı — geri düyməsi, mərkəzdə ad, simmetriya üçün boş sağ sütun. */
export function PageHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between py-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Geri"
        className="text-muted transition-colors hover:text-ink"
      >
        <BackIcon size={20} />
      </button>
      <h1 className="t-headline">{title}</h1>
      <span className="w-5" aria-hidden />
    </header>
  );
}
