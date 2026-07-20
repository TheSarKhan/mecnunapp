import { cn } from "@/lib/cn";

interface Props {
  children: React.ReactNode;
  /** Chat kimi öz daxili sürüşməsi olan ekranlar üçün — kənar padding və mərkəzləmə qalır. */
  fill?: boolean;
  className?: string;
}

/**
 * Bütün ekranların ortaq çərçivəsi.
 *
 * Maksimum 640px sütun bilərəkdən seçilib: dizayn telefona görə qurulub və geniş masaüstündə
 * dartılanda bubble-lar ekranın yarısını keçib söhbət hissini itirir. Sütun sabit qalır, ətrafı
 * fon olur — mobil və web eyni kompozisiyanı göstərir.
 */
export function Screen({ children, fill, className }: Props) {
  return (
    <main
      className={cn(
        "mx-auto flex h-full w-full max-w-[640px] flex-col px-5",
        fill ? "overflow-hidden" : "overflow-y-auto py-8",
        className,
      )}
    >
      {children}
    </main>
  );
}
