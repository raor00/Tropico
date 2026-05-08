import Image from "next/image";
import { TOKENS } from "@/lib/tokens";
import { type MockBalance } from "@/lib/mock-data";
import { formatUSD, formatTokenAmount, formatPercent } from "@/lib/formato";

export function BalanceList({ balances }: { balances: MockBalance[] }) {
  return (
    <div className="panel divide-y divide-tropico-border">
      {balances.map((bal) => {
        const token = TOKENS[bal.symbol];
        const positivo = bal.cambio24h >= 0;
        return (
          <article
            key={bal.symbol}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 overflow-hidden rounded-full border border-tropico-border bg-tropico-ink">
                <Image
                  src={token.logoURI}
                  alt={token.name}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <div className="font-semibold">{bal.symbol}</div>
                <div className="text-xs text-tropico-mute">
                  {formatTokenAmount(bal.amount, token.decimals, { maxDigits: 4 })} {bal.symbol}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-display font-semibold tabular-nums">
                {formatUSD(bal.valueUSD)}
              </div>
              <div
                className={`text-xs ${
                  positivo ? "text-tropico-green" : "text-tropico-coral"
                }`}
              >
                {formatPercent(bal.cambio24h, { signed: true })} 24h
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
