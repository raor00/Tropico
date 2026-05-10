"use client";

import { Mail } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Muestra el email del usuario Privy. Solo se monta si PRIVY_ENABLED.
 */
export function ProfilePrivyEmail() {
  const { user } = usePrivy();
  const email = user?.email?.address ?? user?.google?.email ?? null;

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 md:items-center">
      <div className="flex items-center gap-2">
        <Mail className="size-4 text-tropico-mute" />
        <span className="text-xs font-semibold uppercase tracking-wider text-tropico-mute">
          Email asociado
        </span>
      </div>
      <div className="flex max-w-[60%] items-center justify-end gap-2 md:max-w-[70%]">
        {email ? (
          <span className="break-all text-sm text-tropico-text">{email}</span>
        ) : (
          <span className="text-xs italic text-tropico-mute">No vinculado</span>
        )}
      </div>
    </div>
  );
}
