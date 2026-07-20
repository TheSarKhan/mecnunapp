/**
 * Tam ekran döngüsü ilə oynayan video fon + ağır tünd örtük.
 *
 * Örtük bəzək deyil: brend ciddi monoxromdur ("heç yerdə rəng yoxdur"), ona görə rəngli video
 * dizayn sistemi ilə döyüşür. Örtük rəngi teksturaya endirir və hansı kadr göstərilirsə
 * göstərilsin mətn kontrastını saxlayır.
 *
 * `<video>` bilərəkdən `next/image` kimi optimallaşdırılmır — fayl artıq 720x1280-ə sıxılıb
 * (Pexels 4K orijinalından 24.67 MB → 0.41 MB), mənbə və lisenziya docs/design/README.md-dədir.
 */
export function VideoBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <video
        className="h-full w-full object-cover"
        src="/login-bg.mp4"
        autoPlay
        loop
        // Səssiz olmadan brauzerlər avtomatik oynatmağa icazə vermir; `playsInline` isə iOS
        // Safari-nin videonu tam ekrana çıxarmasının qarşısını alır.
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-bg/[0.72]" />
    </div>
  );
}
