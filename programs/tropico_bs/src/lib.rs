use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Burn, Mint, MintTo, Token, TokenAccount, Transfer,
};

declare_id!("EdWuyZDXao86mTcUSpRVzNXaT9Tb5muU6YGubFhADWdN");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/// Scaling factor for peg_rate: peg_rate == Bs per 1 USD, scaled by 1_000_000.
/// Example: if 1 USD == 36.50 Bs, peg_rate = 36_500_000.
pub const PEG_SCALE: u64 = 1_000_000;

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------

#[program]
pub mod tropico_bs {
    use super::*;

    /// Initialize the BsX protocol.
    ///
    /// Creates the `ProtocolConfig` PDA, delegates mint authority of the
    /// BsX SPL token to that PDA, and stores the initial peg rate.
    ///
    /// # Arguments
    /// * `peg_rate` — Bolívares per 1 USD, scaled by 1_000_000.
    pub fn initialize(ctx: Context<Initialize>, peg_rate: u64) -> Result<()> {
        require!(peg_rate > 0, BsxError::InvalidPegRate);

        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.usdc_mint = ctx.accounts.usdc_mint.key();
        config.bsx_mint = ctx.accounts.bsx_mint.key();
        config.treasury_vault = ctx.accounts.treasury_vault.key();
        config.oracle_authority = ctx.accounts.admin.key(); // admin is oracle by default
        config.paused = false;
        config.peg_rate = peg_rate;
        config.last_peg_update_ts = Clock::get()?.unix_timestamp;
        config.bump = ctx.bumps.config;

        emit!(ProtocolInitialized {
            admin: config.admin,
            bsx_mint: config.bsx_mint,
            peg_rate,
        });

        Ok(())
    }

    /// Update the oracle peg rate.
    ///
    /// Only the `oracle_authority` stored in `ProtocolConfig` may call this.
    ///
    /// # Arguments
    /// * `new_rate` — new Bs/USD rate, scaled by 1_000_000.
    pub fn update_peg(ctx: Context<UpdatePeg>, new_rate: u64) -> Result<()> {
        require!(new_rate > 0, BsxError::InvalidPegRate);

        let config = &mut ctx.accounts.config;
        require!(
            ctx.accounts.oracle.key() == config.oracle_authority,
            BsxError::Unauthorized
        );

        let old_rate = config.peg_rate;
        config.peg_rate = new_rate;
        config.last_peg_update_ts = Clock::get()?.unix_timestamp;

        emit!(PegUpdated {
            old_rate,
            new_rate,
            updated_at: config.last_peg_update_ts,
        });

        Ok(())
    }

    /// Mint BsX tokens by depositing USDC into the program treasury vault.
    ///
    /// Formula: `bsx_amount = usdc_amount * peg_rate / PEG_SCALE`
    ///
    /// # Arguments
    /// * `usdc_amount` — amount of USDC (6 decimals) to deposit.
    pub fn mint_bsx(ctx: Context<MintBsx>, usdc_amount: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, BsxError::ProtocolPaused);
        require!(usdc_amount > 0, BsxError::InvalidPegRate);

        let peg_rate = ctx.accounts.config.peg_rate;

        // bsx_amount = usdc_amount * peg_rate / PEG_SCALE
        let bsx_amount = (usdc_amount as u128)
            .checked_mul(peg_rate as u128)
            .ok_or(BsxError::MathOverflow)?
            .checked_div(PEG_SCALE as u128)
            .ok_or(BsxError::MathOverflow)? as u64;

        require!(bsx_amount > 0, BsxError::InvalidPegRate);

        // 1. Transfer USDC from user → treasury vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_usdc_ata.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, usdc_amount)?;

        // 2. Mint BsX to user
        let config_bump = ctx.accounts.config.bump;
        let seeds: &[&[u8]] = &[b"config", &[config_bump]];
        let signer_seeds = &[seeds];

        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.bsx_mint.to_account_info(),
                to: ctx.accounts.user_bsx_ata.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer_seeds,
        );
        token::mint_to(mint_ctx, bsx_amount)?;

        emit!(BsxMinted {
            user: ctx.accounts.user.key(),
            usdc_deposited: usdc_amount,
            bsx_minted: bsx_amount,
            peg_rate,
        });

        Ok(())
    }

    /// Burn BsX tokens and redeem USDC from the treasury vault.
    ///
    /// Formula: `usdc_amount = bsx_amount * PEG_SCALE / peg_rate`
    ///
    /// # Arguments
    /// * `bsx_amount` — amount of BsX (6 decimals) to burn.
    pub fn burn_bsx(ctx: Context<BurnBsx>, bsx_amount: u64) -> Result<()> {
        require!(!ctx.accounts.config.paused, BsxError::ProtocolPaused);
        require!(bsx_amount > 0, BsxError::InvalidPegRate);

        let peg_rate = ctx.accounts.config.peg_rate;

        // usdc_amount = bsx_amount * PEG_SCALE / peg_rate
        let usdc_amount = (bsx_amount as u128)
            .checked_mul(PEG_SCALE as u128)
            .ok_or(BsxError::MathOverflow)?
            .checked_div(peg_rate as u128)
            .ok_or(BsxError::MathOverflow)? as u64;

        require!(usdc_amount > 0, BsxError::InsufficientReserves);

        // Verify treasury has enough USDC
        require!(
            ctx.accounts.treasury_vault.amount >= usdc_amount,
            BsxError::InsufficientReserves
        );

        // 1. Burn BsX from user ATA
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.bsx_mint.to_account_info(),
                from: ctx.accounts.user_bsx_ata.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(burn_ctx, bsx_amount)?;

        // 2. Transfer USDC from treasury vault → user
        let config_bump = ctx.accounts.config.bump;
        let seeds: &[&[u8]] = &[b"config", &[config_bump]];
        let signer_seeds = &[seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.treasury_vault.to_account_info(),
                to: ctx.accounts.user_usdc_ata.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, usdc_amount)?;

        emit!(BsxBurned {
            user: ctx.accounts.user.key(),
            bsx_burned: bsx_amount,
            usdc_redeemed: usdc_amount,
            peg_rate,
        });

        Ok(())
    }

    /// Attest the current reserve state on-chain.
    ///
    /// Anyone can call this. It reads the treasury vault USDC balance and
    /// the BsX mint supply, writing them to `ReservesAttestation` PDA.
    /// This is the transparency primitive — auditors, users, and frontends
    /// can call this at any time to create a verifiable on-chain snapshot.
    pub fn attest_reserves(ctx: Context<AttestReserves>) -> Result<()> {
        let attestation = &mut ctx.accounts.attestation;
        attestation.total_usdc_reserves = ctx.accounts.treasury_vault.amount;
        attestation.total_bsx_supply = ctx.accounts.bsx_mint.supply;
        attestation.attested_at = Clock::get()?.unix_timestamp;
        attestation.attester = ctx.accounts.attester.key();
        attestation.bump = ctx.bumps.attestation;

        emit!(ReservesAttested {
            total_usdc_reserves: attestation.total_usdc_reserves,
            total_bsx_supply: attestation.total_bsx_supply,
            attested_at: attestation.attested_at,
            attester: attestation.attester,
        });

        Ok(())
    }

    /// Pause or unpause the protocol.
    ///
    /// Only the `admin` stored in `ProtocolConfig` may call this.
    ///
    /// # Arguments
    /// * `paused` — `true` to pause, `false` to unpause.
    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.config.admin,
            BsxError::Unauthorized
        );

        ctx.accounts.config.paused = paused;

        emit!(ProtocolPauseToggled {
            paused,
            by: ctx.accounts.admin.key(),
        });

        Ok(())
    }
}

// ---------------------------------------------------------------------------
// State accounts
// ---------------------------------------------------------------------------

/// Singleton protocol configuration PDA.
/// Seeds: ["config"]
#[account]
#[derive(Default)]
pub struct ProtocolConfig {
    /// Protocol admin — can pause/unpause and is the default oracle authority.
    pub admin: Pubkey,
    /// The USDC SPL mint used as collateral.
    pub usdc_mint: Pubkey,
    /// The BsX SPL mint — mint authority is this PDA.
    pub bsx_mint: Pubkey,
    /// Program-owned ATA that holds USDC reserves.
    pub treasury_vault: Pubkey,
    /// Authority allowed to update the peg rate.
    pub oracle_authority: Pubkey,
    /// When `true`, `mint_bsx` and `burn_bsx` are disabled.
    pub paused: bool,
    /// Current Bs/USD rate, scaled by 1_000_000.
    /// Example: 36.5 Bs/USD → peg_rate = 36_500_000.
    pub peg_rate: u64,
    /// Unix timestamp of the last peg update.
    pub last_peg_update_ts: i64,
    /// PDA bump seed.
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8  // discriminator
        + 32  // admin
        + 32  // usdc_mint
        + 32  // bsx_mint
        + 32  // treasury_vault
        + 32  // oracle_authority
        + 1   // paused
        + 8   // peg_rate
        + 8   // last_peg_update_ts
        + 1;  // bump
}

/// Latest reserve attestation snapshot.
/// Seeds: ["attestation"]
/// Overwritten each time `attest_reserves` is called.
#[account]
#[derive(Default)]
pub struct ReservesAttestation {
    /// USDC balance of the treasury vault at attestation time.
    pub total_usdc_reserves: u64,
    /// Total BsX supply at attestation time.
    pub total_bsx_supply: u64,
    /// Unix timestamp when this attestation was recorded.
    pub attested_at: i64,
    /// The account that invoked `attest_reserves`.
    pub attester: Pubkey,
    /// PDA bump seed.
    pub bump: u8,
}

impl ReservesAttestation {
    pub const LEN: usize = 8  // discriminator
        + 8   // total_usdc_reserves
        + 8   // total_bsx_supply
        + 8   // attested_at
        + 32  // attester
        + 1;  // bump
}

// ---------------------------------------------------------------------------
// Instruction contexts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    /// The USDC SPL mint (pre-existing, e.g. devnet USDC).
    pub usdc_mint: Account<'info, Mint>,

    /// The BsX SPL mint — must be created by the admin before this call,
    /// with mint_authority set to the config PDA address (or use init here
    /// if a new mint is preferred; see note below).
    ///
    /// NOTE: We init the BsX mint here with mint_authority = config PDA,
    /// so the admin does not need to manage the mint key separately.
    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = config,
        seeds = [b"bsx_mint"],
        bump,
    )]
    pub bsx_mint: Account<'info, Mint>,

    /// Program-owned USDC ATA that acts as the reserve vault.
    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = config,
        seeds = [b"treasury_vault"],
        bump,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    /// Protocol config PDA.
    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::LEN,
        seeds = [b"config"],
        bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdatePeg<'info> {
    /// Must match `config.oracle_authority`.
    pub oracle: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,
}

#[derive(Accounts)]
pub struct MintBsx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// BsX mint — authority is the config PDA.
    #[account(
        mut,
        seeds = [b"bsx_mint"],
        bump,
        constraint = bsx_mint.key() == config.bsx_mint,
    )]
    pub bsx_mint: Account<'info, Mint>,

    /// Treasury USDC vault — receives the deposited USDC.
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump,
        constraint = treasury_vault.key() == config.treasury_vault,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    /// User's USDC ATA — source of the deposit.
    #[account(
        mut,
        constraint = user_usdc_ata.mint == config.usdc_mint,
        constraint = user_usdc_ata.owner == user.key(),
    )]
    pub user_usdc_ata: Account<'info, TokenAccount>,

    /// User's BsX ATA — destination of the minted BsX.
    #[account(
        mut,
        constraint = user_bsx_ata.mint == config.bsx_mint,
        constraint = user_bsx_ata.owner == user.key(),
    )]
    pub user_bsx_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnBsx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// BsX mint — supply decreases on burn.
    #[account(
        mut,
        seeds = [b"bsx_mint"],
        bump,
        constraint = bsx_mint.key() == config.bsx_mint,
    )]
    pub bsx_mint: Account<'info, Mint>,

    /// Treasury USDC vault — source of the USDC redemption.
    #[account(
        mut,
        seeds = [b"treasury_vault"],
        bump,
        constraint = treasury_vault.key() == config.treasury_vault,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    /// User's BsX ATA — source of the tokens to burn.
    #[account(
        mut,
        constraint = user_bsx_ata.mint == config.bsx_mint,
        constraint = user_bsx_ata.owner == user.key(),
    )]
    pub user_bsx_ata: Account<'info, TokenAccount>,

    /// User's USDC ATA — destination of the redeemed USDC.
    #[account(
        mut,
        constraint = user_usdc_ata.mint == config.usdc_mint,
        constraint = user_usdc_ata.owner == user.key(),
    )]
    pub user_usdc_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AttestReserves<'info> {
    #[account(mut)]
    pub attester: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,

    /// BsX mint — we read its `.supply` field.
    #[account(
        seeds = [b"bsx_mint"],
        bump,
        constraint = bsx_mint.key() == config.bsx_mint,
    )]
    pub bsx_mint: Account<'info, Mint>,

    /// Treasury vault — we read its `.amount` field.
    #[account(
        seeds = [b"treasury_vault"],
        bump,
        constraint = treasury_vault.key() == config.treasury_vault,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    /// Reserve attestation PDA — init_if_needed so first caller creates it.
    #[account(
        init_if_needed,
        payer = attester,
        space = ReservesAttestation::LEN,
        seeds = [b"attestation"],
        bump,
    )]
    pub attestation: Account<'info, ReservesAttestation>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, ProtocolConfig>,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

#[event]
pub struct ProtocolInitialized {
    pub admin: Pubkey,
    pub bsx_mint: Pubkey,
    pub peg_rate: u64,
}

#[event]
pub struct PegUpdated {
    pub old_rate: u64,
    pub new_rate: u64,
    pub updated_at: i64,
}

#[event]
pub struct BsxMinted {
    pub user: Pubkey,
    pub usdc_deposited: u64,
    pub bsx_minted: u64,
    pub peg_rate: u64,
}

#[event]
pub struct BsxBurned {
    pub user: Pubkey,
    pub bsx_burned: u64,
    pub usdc_redeemed: u64,
    pub peg_rate: u64,
}

#[event]
pub struct ReservesAttested {
    pub total_usdc_reserves: u64,
    pub total_bsx_supply: u64,
    pub attested_at: i64,
    pub attester: Pubkey,
}

#[event]
pub struct ProtocolPauseToggled {
    pub paused: bool,
    pub by: Pubkey,
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum BsxError {
    #[msg("Caller is not authorized to perform this action")]
    Unauthorized,
    #[msg("Protocol is paused — mint and burn are disabled")]
    ProtocolPaused,
    #[msg("Peg rate must be greater than zero")]
    InvalidPegRate,
    #[msg("Treasury reserves are insufficient for this redemption")]
    InsufficientReserves,
    #[msg("Arithmetic overflow in BsX amount calculation")]
    MathOverflow,
}
