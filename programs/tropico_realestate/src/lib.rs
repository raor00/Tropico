use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("3V49YdnmbsHPoguFWhDhyAJhbUASq9s9LAXjxSfBPoWK");

// ---------------------------------------------------------------------------
// Fee constants — CERRADAS por el founder
// ---------------------------------------------------------------------------

/// Venta primaria: 150 bps total (1.5%) sobre el precio. Split: Crixto 90 / Trópico 60.
pub const PRIMARY_FEE_BPS: u64 = 150;
pub const CRIXTO_PRIMARY_BPS: u64 = 90;
pub const TROPICO_PRIMARY_BPS: u64 = 60;

/// Transfer secundario: 100 bps (1%). Split: 50/50.
pub const SECONDARY_FEE_BPS: u64 = 100;
pub const CRIXTO_SECONDARY_BPS: u64 = 50;
pub const TROPICO_SECONDARY_BPS: u64 = 50;

/// Gestión de renta: 10% de lo depositado. Split: Crixto 60 / Trópico 40.
pub const YIELD_FEE_BPS: u64 = 1_000;
pub const CRIXTO_YIELD_BPS: u64 = 600;
pub const TROPICO_YIELD_BPS: u64 = 400;

pub const BPS_DENOMINATOR: u64 = 10_000;

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------

#[program]
pub mod tropico_realestate {
    use super::*;

    /// Inicializa el registro global. Un solo registry por deploy.
    pub fn initialize_registry(
        ctx: Context<InitializeRegistry>,
        operator_authority: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.admin = ctx.accounts.admin.key();
        registry.operator_authority = operator_authority;
        registry.usdc_mint = ctx.accounts.usdc_mint.key();
        registry.paused = false;
        registry.bump = ctx.bumps.registry;

        emit!(RegistryInitialized {
            admin: registry.admin,
            operator_authority,
        });

        Ok(())
    }

    /// Lista un nuevo inmueble: crea PropertyConfig + share_mint (autoridad = PDA) + usdc_vault.
    pub fn list_property(
        ctx: Context<ListProperty>,
        property_id: [u8; 32],
        total_shares: u64,
        price_per_share: u64,
        legal_doc_hash: [u8; 32],
        valuation_usdc: u64,
        tour_url: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.registry.admin == ctx.accounts.admin.key(),
            RealEstateError::Unauthorized
        );
        require!(!ctx.accounts.registry.paused, RealEstateError::ProtocolPaused);
        require!(total_shares > 0, RealEstateError::InvalidAmount);
        require!(price_per_share > 0, RealEstateError::InvalidAmount);
        require!(tour_url.len() <= 200, RealEstateError::TourUrlTooLong);

        let prop = &mut ctx.accounts.property;
        prop.property_id = property_id;
        prop.share_mint = ctx.accounts.share_mint.key();
        prop.usdc_vault = ctx.accounts.usdc_vault.key();
        prop.total_shares = total_shares;
        prop.price_per_share = price_per_share;
        prop.shares_sold = 0;
        prop.legal_doc_hash = legal_doc_hash;
        prop.valuation_usdc = valuation_usdc;
        prop.status = PropertyStatus::Active;
        prop.crixto_fee_bps = CRIXTO_PRIMARY_BPS;
        prop.tropico_fee_bps = TROPICO_PRIMARY_BPS;
        prop.epoch_count = 0;
        prop.bump = ctx.bumps.property;

        emit!(PropertyListed {
            property_id,
            share_mint: prop.share_mint,
            total_shares,
            price_per_share,
            valuation_usdc,
            legal_doc_hash,
        });

        Ok(())
    }

    /// Establece el estado KYC de un inversor. Solo operator_authority puede llamarlo.
    pub fn set_kyc(
        ctx: Context<SetKyc>,
        investor: Pubkey,
        verified: bool,
        expires_at: i64,
    ) -> Result<()> {
        require!(
            ctx.accounts.registry.operator_authority == ctx.accounts.crixto.key(),
            RealEstateError::Unauthorized
        );

        let wl = &mut ctx.accounts.whitelist;
        wl.investor = investor;
        wl.verified = verified;
        wl.verified_by = ctx.accounts.crixto.key();
        wl.expires_at = expires_at;
        wl.bump = ctx.bumps.whitelist;

        emit!(KycSet {
            investor,
            verified,
            expires_at,
            by: ctx.accounts.crixto.key(),
        });

        Ok(())
    }

    /// Compra acciones fraccionadas.
    ///
    /// Mecánica de fees (sobre el precio):
    ///   precio = num_shares × price_per_share
    ///   fee = precio × 150 / 10_000  (1.5%)
    ///   investor transfiere precio + fee
    ///   → precio va al usdc_vault (SPV recibe 100%)
    ///   → 90 bps van a crixto_fee_ata, 60 bps a tropico_fee_ata
    ///   → shares minteadas a investor_share_ata vía PDA signer
    pub fn buy_shares(ctx: Context<BuyShares>, num_shares: u64) -> Result<()> {
        require!(!ctx.accounts.registry.paused, RealEstateError::ProtocolPaused);
        require!(num_shares > 0, RealEstateError::InvalidAmount);

        // KYC check
        let wl = &ctx.accounts.whitelist;
        require!(wl.verified, RealEstateError::KycRequired);
        let now = Clock::get()?.unix_timestamp;
        require!(wl.expires_at == 0 || wl.expires_at > now, RealEstateError::KycExpired);

        let property_key = ctx.accounts.property.key();
        let property_account_info = ctx.accounts.property.to_account_info();
        let prop = &mut ctx.accounts.property;
        require!(prop.status == PropertyStatus::Active, RealEstateError::PropertyNotActive);
        require!(
            prop.shares_sold.checked_add(num_shares).ok_or(RealEstateError::MathOverflow)? <= prop.total_shares,
            RealEstateError::InsufficientShares
        );

        let price_per_share = prop.price_per_share;
        let total_price = (num_shares as u128)
            .checked_mul(price_per_share as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        let total_fee = (total_price as u128)
            .checked_mul(PRIMARY_FEE_BPS as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        let crixto_fee = (total_price as u128)
            .checked_mul(CRIXTO_PRIMARY_BPS as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        let tropico_fee = (total_price as u128)
            .checked_mul(TROPICO_PRIMARY_BPS as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        // 1. Transfer precio (100%) → usdc_vault (SPV)
        let transfer_price_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.investor_usdc_ata.to_account_info(),
                to: ctx.accounts.usdc_vault.to_account_info(),
                authority: ctx.accounts.investor.to_account_info(),
            },
        );
        token::transfer(transfer_price_ctx, total_price)?;

        // 2. Transfer fee Crixto (90 bps)
        if crixto_fee > 0 {
            let transfer_crixto_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.investor_usdc_ata.to_account_info(),
                    to: ctx.accounts.crixto_fee_ata.to_account_info(),
                    authority: ctx.accounts.investor.to_account_info(),
                },
            );
            token::transfer(transfer_crixto_ctx, crixto_fee)?;
        }

        // 3. Transfer fee Trópico (60 bps)
        if tropico_fee > 0 {
            let transfer_tropico_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.investor_usdc_ata.to_account_info(),
                    to: ctx.accounts.tropico_fee_ata.to_account_info(),
                    authority: ctx.accounts.investor.to_account_info(),
                },
            );
            token::transfer(transfer_tropico_ctx, tropico_fee)?;
        }

        // 4. Mint shares al investor vía PDA signer
        let prop_id = prop.property_id;
        let prop_bump = prop.bump;
        let seeds: &[&[u8]] = &[b"property", prop_id.as_ref(), &[prop_bump]];
        let signer_seeds = &[seeds];

        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.share_mint.to_account_info(),
                to: ctx.accounts.investor_share_ata.to_account_info(),
                authority: property_account_info,
            },
            signer_seeds,
        );
        token::mint_to(mint_ctx, num_shares)?;

        // 5. Upsert InvestorPosition
        let position = &mut ctx.accounts.investor_position;
        position.investor = ctx.accounts.investor.key();
        position.property = property_key;
        position.shares_owned = position
            .shares_owned
            .checked_add(num_shares)
            .ok_or(RealEstateError::MathOverflow)?;
        position.bump = ctx.bumps.investor_position;

        prop.shares_sold = prop
            .shares_sold
            .checked_add(num_shares)
            .ok_or(RealEstateError::MathOverflow)?;

        emit!(SharesPurchased {
            investor: ctx.accounts.investor.key(),
            property: property_key,
            num_shares,
            total_price,
            total_fee,
            crixto_fee,
            tropico_fee,
        });

        Ok(())
    }

    /// Transfiere shares entre holders (mercado secundario P2P).
    /// Fee 1% sobre el valor a valuación actual. Requiere KYC del destinatario.
    pub fn transfer_shares(ctx: Context<TransferShares>, amount: u64) -> Result<()> {
        require!(!ctx.accounts.registry.paused, RealEstateError::ProtocolPaused);
        require!(amount > 0, RealEstateError::InvalidAmount);

        // KYC del destinatario
        let wl_to = &ctx.accounts.whitelist_to;
        require!(wl_to.verified, RealEstateError::KycRequired);
        let now = Clock::get()?.unix_timestamp;
        require!(wl_to.expires_at == 0 || wl_to.expires_at > now, RealEstateError::KycExpired);

        // Verificar balance del sender
        require!(
            ctx.accounts.from_share_ata.amount >= amount,
            RealEstateError::InsufficientShares
        );

        // Transfer shares: from → to (authority = sender, SPL transfer estándar)
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_share_ata.to_account_info(),
                to: ctx.accounts.to_share_ata.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update positions
        let from_pos = &mut ctx.accounts.from_position;
        from_pos.shares_owned = from_pos
            .shares_owned
            .checked_sub(amount)
            .ok_or(RealEstateError::MathOverflow)?;

        let to_pos = &mut ctx.accounts.to_position;
        to_pos.investor = ctx.accounts.recipient.key();
        to_pos.property = ctx.accounts.property.key();
        to_pos.shares_owned = to_pos
            .shares_owned
            .checked_add(amount)
            .ok_or(RealEstateError::MathOverflow)?;
        to_pos.bump = ctx.bumps.to_position;

        emit!(SharesTransferred {
            from: ctx.accounts.sender.key(),
            to: ctx.accounts.recipient.key(),
            property: ctx.accounts.property.key(),
            amount,
        });

        Ok(())
    }

    /// Deposita renta. Solo operator_authority. Crea YieldEpoch con snapshot.
    /// Fee 10% descontado del depósito antes de guardar en vault.
    pub fn deposit_yield(
        ctx: Context<DepositYield>,
        gross_usdc: u64,
        attestation: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.registry.operator_authority == ctx.accounts.crixto.key(),
            RealEstateError::Unauthorized
        );
        require!(gross_usdc > 0, RealEstateError::InvalidAmount);

        let crixto_fee = (gross_usdc as u128)
            .checked_mul(CRIXTO_YIELD_BPS as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        let tropico_fee = (gross_usdc as u128)
            .checked_mul(TROPICO_YIELD_BPS as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        let net_usdc = gross_usdc
            .checked_sub(crixto_fee)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_sub(tropico_fee)
            .ok_or(RealEstateError::MathOverflow)?;

        // 1. Transfer net al vault (lo que va a los holders)
        let transfer_net_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.crixto_usdc_ata.to_account_info(),
                to: ctx.accounts.usdc_vault.to_account_info(),
                authority: ctx.accounts.crixto.to_account_info(),
            },
        );
        token::transfer(transfer_net_ctx, net_usdc)?;

        // 2. Transfer fee Crixto
        if crixto_fee > 0 {
            let transfer_crixto_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.crixto_usdc_ata.to_account_info(),
                    to: ctx.accounts.crixto_fee_ata.to_account_info(),
                    authority: ctx.accounts.crixto.to_account_info(),
                },
            );
            token::transfer(transfer_crixto_ctx, crixto_fee)?;
        }

        // 3. Transfer fee Trópico
        if tropico_fee > 0 {
            let transfer_tropico_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.crixto_usdc_ata.to_account_info(),
                    to: ctx.accounts.tropico_fee_ata.to_account_info(),
                    authority: ctx.accounts.crixto.to_account_info(),
                },
            );
            token::transfer(transfer_tropico_ctx, tropico_fee)?;
        }

        // 4. Crear YieldEpoch
        let property_key = ctx.accounts.property.key();
        let prop = &mut ctx.accounts.property;
        let epoch_num = prop.epoch_count;
        prop.epoch_count = prop
            .epoch_count
            .checked_add(1)
            .ok_or(RealEstateError::MathOverflow)?;

        let ye = &mut ctx.accounts.yield_epoch;
        ye.epoch = epoch_num;
        ye.property = property_key;
        ye.total_usdc_net = net_usdc;
        ye.total_shares_snapshot = prop.shares_sold;
        ye.deposited_at = Clock::get()?.unix_timestamp;
        ye.crixto_attestation = attestation;
        ye.bump = ctx.bumps.yield_epoch;

        emit!(YieldDeposited {
            property: property_key,
            epoch: epoch_num,
            gross_usdc,
            net_usdc,
            crixto_fee,
            tropico_fee,
            total_shares_snapshot: ye.total_shares_snapshot,
            attestation,
        });

        Ok(())
    }

    /// Reclama recompensa de un epoch. Pull-based: el holder reclama cuando quiere.
    /// reward = (shares_owned / total_snapshot) × epoch_net_usdc
    pub fn claim_reward(ctx: Context<ClaimReward>, epoch: u64) -> Result<()> {
        require!(!ctx.accounts.registry.paused, RealEstateError::ProtocolPaused);

        let ye = &ctx.accounts.yield_epoch;
        require!(ye.total_shares_snapshot > 0, RealEstateError::InvalidAmount);

        let position = &mut ctx.accounts.investor_position;
        require!(position.shares_owned > 0, RealEstateError::InsufficientShares);
        require!(position.last_claimed_epoch < epoch + 1, RealEstateError::AlreadyClaimed);

        let reward = (position.shares_owned as u128)
            .checked_mul(ye.total_usdc_net as u128)
            .ok_or(RealEstateError::MathOverflow)?
            .checked_div(ye.total_shares_snapshot as u128)
            .ok_or(RealEstateError::MathOverflow)? as u64;

        require!(reward > 0, RealEstateError::InvalidAmount);

        // Transfer USDC vault → investor vía PDA signer
        let prop_id = ctx.accounts.property.property_id;
        let prop_bump = ctx.accounts.property.bump;
        let seeds: &[&[u8]] = &[b"property", prop_id.as_ref(), &[prop_bump]];
        let signer_seeds = &[seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.usdc_vault.to_account_info(),
                to: ctx.accounts.investor_usdc_ata.to_account_info(),
                authority: ctx.accounts.property.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, reward)?;

        position.last_claimed_epoch = epoch + 1;

        emit!(RewardClaimed {
            investor: ctx.accounts.investor.key(),
            property: ctx.accounts.property.key(),
            epoch,
            reward_usdc: reward,
            shares_owned: position.shares_owned,
            total_snapshot: ye.total_shares_snapshot,
        });

        Ok(())
    }

    /// Crea una propuesta de gobernanza.
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: u64,
        title_hash: [u8; 32],
        uri: String,
        end_ts: i64,
    ) -> Result<()> {
        require!(!ctx.accounts.registry.paused, RealEstateError::ProtocolPaused);
        require!(uri.len() <= 200, RealEstateError::TourUrlTooLong);
        require!(
            ctx.accounts.proposer_share_ata.amount > 0,
            RealEstateError::InsufficientShares
        );

        let start_ts = Clock::get()?.unix_timestamp;
        require!(end_ts > start_ts, RealEstateError::InvalidAmount);

        let proposal = &mut ctx.accounts.proposal;
        proposal.property = ctx.accounts.property.key();
        proposal.proposal_id = proposal_id;
        proposal.creator = ctx.accounts.proposer.key();
        proposal.title_hash = title_hash;
        proposal.uri = uri;
        proposal.yes_weight = 0;
        proposal.no_weight = 0;
        proposal.start_ts = start_ts;
        proposal.end_ts = end_ts;
        proposal.executed = false;
        proposal.snapshot_total_shares = ctx.accounts.property.shares_sold;
        proposal.bump = ctx.bumps.proposal;

        emit!(ProposalCreated {
            property: ctx.accounts.property.key(),
            proposal_id,
            creator: ctx.accounts.proposer.key(),
            end_ts,
            snapshot_total_shares: proposal.snapshot_total_shares,
        });

        Ok(())
    }

    /// Vota en una propuesta. Peso = balance de shares vivo.
    pub fn vote(ctx: Context<Vote>, approve: bool) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let proposal_key = ctx.accounts.proposal.key();
        let proposal = &mut ctx.accounts.proposal;

        require!(!proposal.executed, RealEstateError::ProposalExecuted);
        require!(now >= proposal.start_ts, RealEstateError::VotingNotStarted);
        require!(now < proposal.end_ts, RealEstateError::VotingEnded);

        let weight = ctx.accounts.voter_share_ata.amount;
        require!(weight > 0, RealEstateError::InsufficientShares);

        let receipt = &mut ctx.accounts.vote_receipt;
        receipt.voter = ctx.accounts.voter.key();
        receipt.proposal = proposal_key;
        receipt.weight = weight;
        receipt.approve = approve;
        receipt.bump = ctx.bumps.vote_receipt;

        if approve {
            proposal.yes_weight = proposal
                .yes_weight
                .checked_add(weight)
                .ok_or(RealEstateError::MathOverflow)?;
        } else {
            proposal.no_weight = proposal
                .no_weight
                .checked_add(weight)
                .ok_or(RealEstateError::MathOverflow)?;
        }

        emit!(VoteCast {
            voter: ctx.accounts.voter.key(),
            proposal: proposal_key,
            weight,
            approve,
        });

        Ok(())
    }

    /// Ejecuta propuesta aprobada (mayoría simple, after end_ts).
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let proposal = &mut ctx.accounts.proposal;

        require!(!proposal.executed, RealEstateError::ProposalExecuted);
        require!(now >= proposal.end_ts, RealEstateError::VotingNotEnded);
        require!(
            proposal.yes_weight > proposal.no_weight,
            RealEstateError::ProposalRejected
        );

        proposal.executed = true;

        emit!(ProposalExecuted {
            property: proposal.property,
            proposal_id: proposal.proposal_id,
            yes_weight: proposal.yes_weight,
            no_weight: proposal.no_weight,
        });

        Ok(())
    }

    /// Actualiza valuación del inmueble. Solo operator_authority.
    pub fn update_valuation(
        ctx: Context<UpdateValuation>,
        new_valuation: u64,
        attestation: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.registry.operator_authority == ctx.accounts.crixto.key(),
            RealEstateError::Unauthorized
        );
        require!(new_valuation > 0, RealEstateError::InvalidAmount);

        let old = ctx.accounts.property.valuation_usdc;
        ctx.accounts.property.valuation_usdc = new_valuation;

        emit!(ValuationUpdated {
            property: ctx.accounts.property.key(),
            old_valuation: old,
            new_valuation,
            attestation,
        });

        Ok(())
    }

    /// Pausa o reanuda el protocolo. Solo admin.
    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.registry.admin,
            RealEstateError::Unauthorized
        );
        ctx.accounts.registry.paused = paused;

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

/// Singleton global del protocolo. Seeds: ["registry"]
#[account]
#[derive(Default)]
pub struct RegistryConfig {
    pub admin: Pubkey,
    pub operator_authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

impl RegistryConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1 + 1;
}

/// Por inmueble. Seeds: ["property", property_id]
#[account]
pub struct PropertyConfig {
    pub property_id: [u8; 32],
    pub share_mint: Pubkey,
    pub usdc_vault: Pubkey,
    pub total_shares: u64,
    pub price_per_share: u64,
    pub shares_sold: u64,
    pub legal_doc_hash: [u8; 32],
    pub valuation_usdc: u64,
    pub status: PropertyStatus,
    pub crixto_fee_bps: u64,
    pub tropico_fee_bps: u64,
    pub epoch_count: u64,
    pub bump: u8,
}

impl PropertyConfig {
    pub const LEN: usize = 8
        + 32  // property_id
        + 32  // share_mint
        + 32  // usdc_vault
        + 8   // total_shares
        + 8   // price_per_share
        + 8   // shares_sold
        + 32  // legal_doc_hash
        + 8   // valuation_usdc
        + 1   // status
        + 8   // crixto_fee_bps
        + 8   // tropico_fee_bps
        + 8   // epoch_count
        + 1;  // bump
}

/// Posición de un inversor en un inmueble. Seeds: ["position", property, investor]
#[account]
#[derive(Default)]
pub struct InvestorPosition {
    pub investor: Pubkey,
    pub property: Pubkey,
    pub shares_owned: u64,
    pub last_claimed_epoch: u64,
    pub bump: u8,
}

impl InvestorPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

/// Snapshot de renta para un epoch. Seeds: ["yield", property, epoch_bytes]
#[account]
pub struct YieldEpoch {
    pub epoch: u64,
    pub property: Pubkey,
    pub total_usdc_net: u64,
    pub total_shares_snapshot: u64,
    pub deposited_at: i64,
    pub crixto_attestation: [u8; 32],
    pub bump: u8,
}

impl YieldEpoch {
    pub const LEN: usize = 8 + 8 + 32 + 8 + 8 + 8 + 32 + 1;
}

/// Gate KYC por inversor. Seeds: ["kyc", investor]
#[account]
#[derive(Default)]
pub struct Whitelist {
    pub investor: Pubkey,
    pub verified: bool,
    pub verified_by: Pubkey,
    pub expires_at: i64,
    pub bump: u8,
}

impl Whitelist {
    pub const LEN: usize = 8 + 32 + 1 + 32 + 8 + 1;
}

/// Propuesta de gobernanza. Seeds: ["proposal", property, proposal_id_bytes]
#[account]
pub struct Proposal {
    pub property: Pubkey,
    pub proposal_id: u64,
    pub creator: Pubkey,
    pub title_hash: [u8; 32],
    pub uri: String,
    pub yes_weight: u64,
    pub no_weight: u64,
    pub start_ts: i64,
    pub end_ts: i64,
    pub executed: bool,
    pub snapshot_total_shares: u64,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 8
        + 32  // property
        + 8   // proposal_id
        + 32  // creator
        + 32  // title_hash
        + 4 + 200 // uri (string prefix + max len)
        + 8   // yes_weight
        + 8   // no_weight
        + 8   // start_ts
        + 8   // end_ts
        + 1   // executed
        + 8   // snapshot_total_shares
        + 1;  // bump
}

/// Anti-doble-voto. Seeds: ["vote", proposal, voter]
#[account]
#[derive(Default)]
pub struct VoteReceipt {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub weight: u64,
    pub approve: bool,
    pub bump: u8,
}

impl VoteReceipt {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 1;
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum PropertyStatus {
    Draft,
    Active,
    Paused,
    Closed,
}

impl Default for PropertyStatus {
    fn default() -> Self {
        PropertyStatus::Draft
    }
}

// ---------------------------------------------------------------------------
// Instruction contexts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        space = RegistryConfig::LEN,
        seeds = [b"registry"],
        bump,
    )]
    pub registry: Account<'info, RegistryConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(property_id: [u8; 32])]
pub struct ListProperty<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Box<Account<'info, RegistryConfig>>,

    #[account(
        init,
        payer = admin,
        space = PropertyConfig::LEN,
        seeds = [b"property", property_id.as_ref()],
        bump,
    )]
    pub property: Box<Account<'info, PropertyConfig>>,

    /// Share mint — autoridad es el property PDA
    #[account(
        init,
        payer = admin,
        mint::decimals = 0,
        mint::authority = property,
        seeds = [b"share_mint", property_id.as_ref()],
        bump,
    )]
    pub share_mint: Box<Account<'info, Mint>>,

    /// USDC vault del inmueble — autoridad es el property PDA
    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = property,
        seeds = [b"usdc_vault", property_id.as_ref()],
        bump,
    )]
    pub usdc_vault: Box<Account<'info, TokenAccount>>,

    pub usdc_mint: Box<Account<'info, Mint>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(investor: Pubkey)]
pub struct SetKyc<'info> {
    #[account(mut)]
    pub crixto: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(
        init_if_needed,
        payer = crixto,
        space = Whitelist::LEN,
        seeds = [b"kyc", investor.as_ref()],
        bump,
    )]
    pub whitelist: Account<'info, Whitelist>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(
        mut,
        seeds = [b"property", property.property_id.as_ref()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyConfig>,

    /// KYC del investor
    #[account(
        seeds = [b"kyc", investor.key().as_ref()],
        bump = whitelist.bump,
    )]
    pub whitelist: Account<'info, Whitelist>,

    /// Share mint del inmueble
    #[account(
        mut,
        constraint = share_mint.key() == property.share_mint,
    )]
    pub share_mint: Account<'info, Mint>,

    /// USDC vault del inmueble
    #[account(
        mut,
        constraint = usdc_vault.key() == property.usdc_vault,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// ATA USDC del investor (fuente de fondos)
    #[account(
        mut,
        constraint = investor_usdc_ata.owner == investor.key(),
        constraint = investor_usdc_ata.mint == registry.usdc_mint,
    )]
    pub investor_usdc_ata: Account<'info, TokenAccount>,

    /// ATA de shares del investor (destino)
    #[account(
        mut,
        constraint = investor_share_ata.owner == investor.key(),
        constraint = investor_share_ata.mint == property.share_mint,
    )]
    pub investor_share_ata: Account<'info, TokenAccount>,

    /// ATA USDC de Crixto (recibe 90 bps)
    #[account(
        mut,
        constraint = crixto_fee_ata.mint == registry.usdc_mint,
    )]
    pub crixto_fee_ata: Account<'info, TokenAccount>,

    /// ATA USDC de Trópico (recibe 60 bps)
    #[account(
        mut,
        constraint = tropico_fee_ata.mint == registry.usdc_mint,
    )]
    pub tropico_fee_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = investor,
        space = InvestorPosition::LEN,
        seeds = [b"position", property.key().as_ref(), investor.key().as_ref()],
        bump,
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferShares<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: recipient es solo el destino de las shares; su KYC se valida via whitelist_to
    pub recipient: UncheckedAccount<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(seeds = [b"property", property.property_id.as_ref()], bump = property.bump)]
    pub property: Account<'info, PropertyConfig>,

    /// KYC del destinatario
    #[account(
        seeds = [b"kyc", recipient.key().as_ref()],
        bump = whitelist_to.bump,
    )]
    pub whitelist_to: Account<'info, Whitelist>,

    #[account(
        mut,
        constraint = from_share_ata.owner == sender.key(),
        constraint = from_share_ata.mint == property.share_mint,
    )]
    pub from_share_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = to_share_ata.owner == recipient.key(),
        constraint = to_share_ata.mint == property.share_mint,
    )]
    pub to_share_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"position", property.key().as_ref(), sender.key().as_ref()],
        bump = from_position.bump,
    )]
    pub from_position: Account<'info, InvestorPosition>,

    #[account(
        init_if_needed,
        payer = sender,
        space = InvestorPosition::LEN,
        seeds = [b"position", property.key().as_ref(), recipient.key().as_ref()],
        bump,
    )]
    pub to_position: Account<'info, InvestorPosition>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(gross_usdc: u64, attestation: [u8; 32])]
pub struct DepositYield<'info> {
    #[account(mut)]
    pub crixto: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(
        mut,
        seeds = [b"property", property.property_id.as_ref()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyConfig>,

    #[account(
        mut,
        constraint = usdc_vault.key() == property.usdc_vault,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// USDC de Crixto (fuente de la renta bruta)
    #[account(
        mut,
        constraint = crixto_usdc_ata.owner == crixto.key(),
        constraint = crixto_usdc_ata.mint == registry.usdc_mint,
    )]
    pub crixto_usdc_ata: Account<'info, TokenAccount>,

    #[account(mut, constraint = crixto_fee_ata.mint == registry.usdc_mint)]
    pub crixto_fee_ata: Account<'info, TokenAccount>,

    #[account(mut, constraint = tropico_fee_ata.mint == registry.usdc_mint)]
    pub tropico_fee_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = crixto,
        space = YieldEpoch::LEN,
        seeds = [b"yield", property.key().as_ref(), &property.epoch_count.to_le_bytes()],
        bump,
    )]
    pub yield_epoch: Account<'info, YieldEpoch>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(epoch: u64)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(seeds = [b"property", property.property_id.as_ref()], bump = property.bump)]
    pub property: Account<'info, PropertyConfig>,

    #[account(
        seeds = [b"yield", property.key().as_ref(), &epoch.to_le_bytes()],
        bump = yield_epoch.bump,
    )]
    pub yield_epoch: Account<'info, YieldEpoch>,

    #[account(
        mut,
        seeds = [b"position", property.key().as_ref(), investor.key().as_ref()],
        bump = investor_position.bump,
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    #[account(
        mut,
        constraint = usdc_vault.key() == property.usdc_vault,
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = investor_usdc_ata.owner == investor.key(),
        constraint = investor_usdc_ata.mint == registry.usdc_mint,
    )]
    pub investor_usdc_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(seeds = [b"property", property.property_id.as_ref()], bump = property.bump)]
    pub property: Account<'info, PropertyConfig>,

    #[account(
        constraint = proposer_share_ata.owner == proposer.key(),
        constraint = proposer_share_ata.mint == property.share_mint,
    )]
    pub proposer_share_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = proposer,
        space = Proposal::LEN,
        seeds = [b"proposal", property.key().as_ref(), &proposal_id.to_le_bytes()],
        bump,
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(seeds = [b"property", property.property_id.as_ref()], bump = property.bump)]
    pub property: Account<'info, PropertyConfig>,

    #[account(
        mut,
        seeds = [b"proposal", property.key().as_ref(), &proposal.proposal_id.to_le_bytes()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        constraint = voter_share_ata.owner == voter.key(),
        constraint = voter_share_ata.mint == property.share_mint,
    )]
    pub voter_share_ata: Account<'info, TokenAccount>,

    /// Anti-doble-voto: init falla si ya existe (ya votó)
    #[account(
        init,
        payer = voter,
        space = VoteReceipt::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump,
    )]
    pub vote_receipt: Account<'info, VoteReceipt>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,

    #[account(seeds = [b"property", property.property_id.as_ref()], bump = property.bump)]
    pub property: Account<'info, PropertyConfig>,

    #[account(
        mut,
        seeds = [b"proposal", property.key().as_ref(), &proposal.proposal_id.to_le_bytes()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
pub struct UpdateValuation<'info> {
    pub crixto: Signer<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, RegistryConfig>,

    #[account(
        mut,
        seeds = [b"property", property.property_id.as_ref()],
        bump = property.bump,
    )]
    pub property: Account<'info, PropertyConfig>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump,
    )]
    pub registry: Account<'info, RegistryConfig>,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

#[event]
pub struct RegistryInitialized {
    pub admin: Pubkey,
    pub operator_authority: Pubkey,
}

#[event]
pub struct PropertyListed {
    pub property_id: [u8; 32],
    pub share_mint: Pubkey,
    pub total_shares: u64,
    pub price_per_share: u64,
    pub valuation_usdc: u64,
    pub legal_doc_hash: [u8; 32],
}

#[event]
pub struct KycSet {
    pub investor: Pubkey,
    pub verified: bool,
    pub expires_at: i64,
    pub by: Pubkey,
}

#[event]
pub struct SharesPurchased {
    pub investor: Pubkey,
    pub property: Pubkey,
    pub num_shares: u64,
    pub total_price: u64,
    pub total_fee: u64,
    pub crixto_fee: u64,
    pub tropico_fee: u64,
}

#[event]
pub struct SharesTransferred {
    pub from: Pubkey,
    pub to: Pubkey,
    pub property: Pubkey,
    pub amount: u64,
}

#[event]
pub struct YieldDeposited {
    pub property: Pubkey,
    pub epoch: u64,
    pub gross_usdc: u64,
    pub net_usdc: u64,
    pub crixto_fee: u64,
    pub tropico_fee: u64,
    pub total_shares_snapshot: u64,
    pub attestation: [u8; 32],
}

#[event]
pub struct RewardClaimed {
    pub investor: Pubkey,
    pub property: Pubkey,
    pub epoch: u64,
    pub reward_usdc: u64,
    pub shares_owned: u64,
    pub total_snapshot: u64,
}

#[event]
pub struct ProposalCreated {
    pub property: Pubkey,
    pub proposal_id: u64,
    pub creator: Pubkey,
    pub end_ts: i64,
    pub snapshot_total_shares: u64,
}

#[event]
pub struct VoteCast {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub weight: u64,
    pub approve: bool,
}

#[event]
pub struct ProposalExecuted {
    pub property: Pubkey,
    pub proposal_id: u64,
    pub yes_weight: u64,
    pub no_weight: u64,
}

#[event]
pub struct ValuationUpdated {
    pub property: Pubkey,
    pub old_valuation: u64,
    pub new_valuation: u64,
    pub attestation: [u8; 32],
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
pub enum RealEstateError {
    #[msg("Caller is not authorized")]
    Unauthorized,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Investor KYC is required")]
    KycRequired,
    #[msg("Investor KYC has expired")]
    KycExpired,
    #[msg("Property is not active")]
    PropertyNotActive,
    #[msg("Insufficient shares available")]
    InsufficientShares,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Reward already claimed for this epoch")]
    AlreadyClaimed,
    #[msg("Proposal already executed")]
    ProposalExecuted,
    #[msg("Voting has not started yet")]
    VotingNotStarted,
    #[msg("Voting period has ended")]
    VotingEnded,
    #[msg("Voting period has not ended yet")]
    VotingNotEnded,
    #[msg("Proposal was rejected")]
    ProposalRejected,
    #[msg("Tour URL too long (max 200 chars)")]
    TourUrlTooLong,
}
