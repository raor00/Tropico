// Tropico Treasury — Anchor program custom
//
// Propósito: registrar on-chain CADA fee que cobra Tropico, con auditabilidad
// total y transparencia radical (principio del producto). El dashboard
// /transparency (Q3 2026) lee este program para mostrar live cuánto ha cobrado
// el proyecto, en qué módulo (swap/pay/yield), y de qué wallet.
//
// Diseño minimalista pero útil:
//   - PDA "treasury_state" globalmente único (seeds: ["treasury"])
//   - Counter total_fees_lamports + total_tx_count
//   - Per-module breakdown (swap, pay, yield, cashback) en Vec
//   - Event emit en cada record_fee → indexable off-chain
//   - Authority única (cofounder) para inicializar; Q4 multi-sig via Squads
//
// NO custodia tokens del usuario — solo registra metadata pública.
// Las llaves del usuario nunca tocan este program. Tropico sigue 100%
// non-custodial — este program es solo TRANSPARENCIA RADICAL.

use anchor_lang::prelude::*;

declare_id!("3a5NkTssAsVaarUPqx4YokNwUcfxHnNebGugrgBBxe8S");

#[program]
pub mod tropico_treasury {
    use super::*;

    /// Inicializa el state global del treasury (1 sola vez por deploy)
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.total_fees_lamports = 0;
        state.total_tx_count = 0;
        state.bump = ctx.bumps.state;

        emit!(TreasuryInitialized {
            authority: state.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    /// Registers a fee on-chain. Only the stored authority (Tropico server key)
    /// may call this — enforced by the require! check below.
    /// The program does NOT custody tokens — it only stores public verifiable metadata.
    pub fn record_fee(
        ctx: Context<RecordFee>,
        amount_lamports: u64,
        module: ModuleType,
        user: Pubkey,
    ) -> Result<()> {
        require!(
            ctx.accounts.recorder.key() == ctx.accounts.state.authority,
            TreasuryError::Unauthorized
        );
        require!(amount_lamports > 0, TreasuryError::ZeroAmount);

        let state = &mut ctx.accounts.state;
        state.total_fees_lamports = state
            .total_fees_lamports
            .checked_add(amount_lamports)
            .ok_or(TreasuryError::Overflow)?;
        state.total_tx_count = state
            .total_tx_count
            .checked_add(1)
            .ok_or(TreasuryError::Overflow)?;

        emit!(FeeRecorded {
            user,
            module,
            amount_lamports,
            new_total: state.total_fees_lamports,
            tx_count: state.total_tx_count,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    /// Lectura pública del state (cualquiera puede ver via getAccountInfo)
    pub fn read_stats(ctx: Context<ReadStats>) -> Result<TreasurySnapshot> {
        let s = &ctx.accounts.state;
        Ok(TreasurySnapshot {
            authority: s.authority,
            total_fees_lamports: s.total_fees_lamports,
            total_tx_count: s.total_tx_count,
        })
    }
}

/* ═══ ACCOUNTS ════════════════════════════════════════════════════════ */

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryState::SIZE,
        seeds = [b"treasury"],
        bump
    )]
    pub state: Account<'info, TreasuryState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordFee<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = state.bump,
    )]
    pub state: Account<'info, TreasuryState>,

    /// Must be the authority stored in state — enforced in the handler.
    pub recorder: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReadStats<'info> {
    #[account(seeds = [b"treasury"], bump = state.bump)]
    pub state: Account<'info, TreasuryState>,
}

/* ═══ STATE ═══════════════════════════════════════════════════════════ */

#[account]
pub struct TreasuryState {
    /// Cofounder authority (Q4: multi-sig Squads PDA)
    pub authority: Pubkey,         // 32 bytes
    /// Total acumulado de fees (en lamports — 1 USDC = 1_000_000)
    pub total_fees_lamports: u64,  // 8 bytes
    /// Cuántas tx registradas
    pub total_tx_count: u64,       // 8 bytes
    /// PDA bump
    pub bump: u8,                  // 1 byte
}

impl TreasuryState {
    pub const SIZE: usize = 32 + 8 + 8 + 1;
}

/* ═══ ENUMS ═══════════════════════════════════════════════════════════ */

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum ModuleType {
    Swap,           // /cambiar
    Pay,            // /cobrar
    Yield,          // /guardar
    Cashback,       // /guacama/agente cashback
    Remesas,        // /remesas
    Servicios,      // /pagar-servicios
    P2pBs,          // /cambiar tab Bolivares
    TropicoPay,     // /api/checkout/create
    RealEstate,     // /inmuebles — venta primaria
    RealEstateYield, // /inmuebles — gestión de renta
    RealEstateSecondary, // /inmuebles — transfer secundario
}

/* ═══ EVENTS — indexables off-chain ══════════════════════════════════ */

#[event]
pub struct TreasuryInitialized {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct FeeRecorded {
    pub user: Pubkey,
    pub module: ModuleType,
    pub amount_lamports: u64,
    pub new_total: u64,
    pub tx_count: u64,
    pub timestamp: i64,
}

/* ═══ RETURN TYPES ══════════════════════════════════════════════════ */

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TreasurySnapshot {
    pub authority: Pubkey,
    pub total_fees_lamports: u64,
    pub total_tx_count: u64,
}

/* ═══ ERRORS ═══════════════════════════════════════════════════════════ */

#[error_code]
pub enum TreasuryError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Only the authority may record fees")]
    Unauthorized,
}
