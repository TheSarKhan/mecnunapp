/**
 * Persona yazır — üç nöqtə növbə ilə qalxır.
 *
 * Animasiya CSS-dədir, JS-də yox: bubble cavab gözlənən bütün müddət ekranda qalır və hər
 * kadrda React render etməyin mənası yoxdur.
 */
export function TypingBubble() {
  return (
    <div
      className="mt-3.5 flex w-fit items-center gap-1 rounded-[20px] rounded-bl-[6px] bg-bubble px-4 py-3.5"
      aria-label="yazır"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}
