/**
 * Math de yield para real estate.
 * Pro-rata: reward = (shares_owned / total_snapshot) * epoch_net_usdc
 * Fase 0: cálculo off-chain para mostrar en UI antes de claim on-chain.
 */

export type YieldEpochData = {
  epoch: number;
  totalUsdcNet: number;
  totalSharesSnapshot: number;
  depositedAt: number;
};

/** Calcula reward reclamable para un investor en un epoch dado */
export function calcClaimable(
  sharesOwned: number,
  epoch: YieldEpochData
): number {
  if (epoch.totalSharesSnapshot === 0 || sharesOwned === 0) return 0;
  return (sharesOwned / epoch.totalSharesSnapshot) * epoch.totalUsdcNet;
}

/** Suma todos los rewards reclamables de epochs no reclamados */
export function calcTotalClaimable(
  sharesOwned: number,
  epochs: YieldEpochData[],
  lastClaimedEpoch: number
): number {
  return epochs
    .filter((e) => e.epoch >= lastClaimedEpoch)
    .reduce((acc, e) => acc + calcClaimable(sharesOwned, e), 0);
}

/** APY estimado a partir del último epoch (annualizado) */
export function calcApy(
  pricePerShare: number,
  epoch: YieldEpochData,
  periodsPerYear = 12
): number {
  if (epoch.totalSharesSnapshot === 0 || pricePerShare === 0) return 0;
  const rewardPerShare = epoch.totalUsdcNet / epoch.totalSharesSnapshot;
  const periodReturn = rewardPerShare / pricePerShare;
  return periodReturn * periodsPerYear * 100;
}

// Fee constants (mirrors on-chain)
export const PRIMARY_FEE_BPS = 150;
export const CRIXTO_PRIMARY_BPS = 90;
export const TROPICO_PRIMARY_BPS = 60;

/** Desglosa el fee de venta primaria dado un precio total */
export function calcPrimaryFee(totalPrice: number): {
  fee: number;
  crixtoFee: number;
  tropicoFee: number;
  total: number;
} {
  const fee = (totalPrice * PRIMARY_FEE_BPS) / 10_000;
  const crixtoFee = (totalPrice * CRIXTO_PRIMARY_BPS) / 10_000;
  const tropicoFee = (totalPrice * TROPICO_PRIMARY_BPS) / 10_000;
  return { fee, crixtoFee, tropicoFee, total: totalPrice + fee };
}
