"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

interface Props {
  siteKey: string;
  onToken: (token: string) => void;
}

export default function TurnstileWidget({ siteKey, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const render = () => {
      if (containerRef.current && window.turnstile && !widgetId.current) {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onToken,
        });
      }
    };

    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, onToken]);

  return <div ref={containerRef} />;
}
