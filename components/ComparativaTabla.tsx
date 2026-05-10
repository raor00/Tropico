import { formatUSD } from "@/lib/formato";

const ROWS: Array<{ ventas: number }> = [
  { ventas: 1_000 },
  { ventas: 5_000 },
  { ventas: 10_000 },
  { ventas: 25_000 },
];

const BANESCO_RATE = 0.045;
const TROPICO_RATE = 0.01;

export function ComparativaTabla() {
  const totalAhorroAnual = ROWS.reduce(
    (acc, row) => acc + row.ventas * (BANESCO_RATE - TROPICO_RATE) * 12,
    0
  );

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-tropico-border bg-tropico-ink/40 px-5 py-4">
        <h3 className="font-display text-xl font-bold">
          Cuánto te ahorras vs POS tradicional
        </h3>
        <p className="text-sm text-tropico-mute">
          Sobre tu volumen mensual real de ventas. Cálculo conservador, sin contar
          tiempo ahorrado en settlement ni chargebacks evitados.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-tropico-border text-left text-xs uppercase tracking-wider text-tropico-mute">
              <th className="px-5 py-3">Tu venta mensual</th>
              <th className="px-5 py-3">POS tradicional (4.5%)</th>
              <th className="px-5 py-3">Tropico (1%)</th>
              <th className="px-5 py-3 text-right">
                <span className="text-tropico-green">Ahorras</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tropico-border">
            {ROWS.map((row) => {
              const banesco = row.ventas * BANESCO_RATE;
              const tropico = row.ventas * TROPICO_RATE;
              const ahorro = banesco - tropico;
              return (
                <tr
                  key={row.ventas}
                  className="text-sm transition hover:bg-tropico-ink/30"
                >
                  <td className="px-5 py-4 font-semibold">
                    {formatUSD(row.ventas)}
                  </td>
                  <td className="px-5 py-4 text-tropico-coral">
                    {formatUSD(banesco)}
                  </td>
                  <td className="px-5 py-4 text-tropico-text">
                    {formatUSD(tropico)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="rounded-md bg-tropico-green/10 px-2 py-1 font-bold text-tropico-green">
                      +{formatUSD(ahorro)}/mes
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-tropico-border bg-gradient-to-r from-tropico-green/10 to-transparent px-5 py-4">
        <p className="text-sm text-tropico-text/90">
          Eso son entre <strong>$420</strong> y <strong>$10.500</strong> al año
          en tu bolsillo. Por solo cambiar tu método de cobro.
        </p>
        <p className="mt-2 text-xs text-tropico-mute">
          Con Tropico, <span className="font-semibold text-tropico-sea">recibes el 100% del precio que pones</span>.
          El fee se cobra al cliente encima del monto — nunca sale de lo que acordaste cobrar.
          El POS tradicional te retiene el 4.5% de cada cobro.
        </p>
      </div>
    </div>
  );
}
