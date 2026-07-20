"use client";

import { useEffect, useRef } from "react";

const GSI_SRC = "https://accounts.google.com/gsi/client";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/**
 * Web-də Google girişi mobildən fərqli olaraq **işləyir**.
 *
 * Səbəb sadədir: Google Web client-i üçün icazəli origin (`http://localhost:3000` kimi) qəbul
 * edir, Expo Go-nun `exp://` redirect-ini isə yox. Ona görə burada dev build tələb olunmur —
 * sadəcə Cloud Console-da origin əlavə olunmalıdır.
 */
export function isGoogleSignInAvailable(): boolean {
  return GOOGLE_CLIENT_ID.length > 0;
}

interface Props {
  onIdToken: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number>,
      ) => void;
    };
  };
}

function loadGsi(): Promise<GoogleAccounts> {
  const existing = (window as unknown as { google?: GoogleAccounts }).google;
  if (existing?.accounts?.id) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    // Skript bir dəfə yüklənir; ikinci düymə onu təkrar çəkməsin.
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => {
      const google = (window as unknown as { google?: GoogleAccounts }).google;
      if (google?.accounts?.id) resolve(google);
      else reject(new Error("GSI yüklənmədi"));
    });
    script.addEventListener("error", () => reject(new Error("GSI yüklənmədi")));
  });
}

/**
 * Google Identity Services düyməsi.
 *
 * Düymənin görünüşünü Google özü çəkir — `filled_black` monoxrom sistemə ən yaxın variantdır.
 * Öz düyməmizlə əvəzləmək brend qaydalarını pozardı və Google bunu qadağan edir.
 */
export function GoogleSignInButton({ onIdToken, onError }: Props) {
  const container = useRef<HTMLDivElement>(null);
  // Callback ref-də saxlanılır ki, `initialize` yalnız bir dəfə çağırılsın: GSI eyni elementə
  // təkrar render olunanda düyməni ikiləşdirir.
  const handler = useRef(onIdToken);
  handler.current = onIdToken;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !container.current) return;
    let cancelled = false;

    loadGsi()
      .then((google) => {
        if (cancelled || !container.current) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) void handler.current(response.credential);
            else onError("Google ID token qaytarmadı.");
          },
        });
        google.accounts.id.renderButton(container.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 320,
        });
      })
      .catch(() => {
        if (!cancelled) onError("Google girişi yüklənmədi.");
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  return <div ref={container} className="flex justify-center" />;
}
