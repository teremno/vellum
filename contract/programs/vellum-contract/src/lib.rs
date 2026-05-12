use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN");

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DISCRIMINATOR_SIZE: usize = 8;

// ─────────────────────────────────────────────────────────────
// Error Codes
// ─────────────────────────────────────────────────────────────

#[error_code]
pub enum VellumError {
    #[msg("Invoice amount must be greater than zero")]
    InvalidAmount,
    #[msg("Due date must be in the future")]
    DueDateInPast,
    #[msg("Only the designated payer can pay this invoice")]
    UnauthorizedPayer,
    #[msg("Only the payer can dispute this invoice")]
    UnauthorizedDisputer,
    #[msg("Invoice is not in a payable state")]
    InvoiceNotPayable,
    #[msg("Invoice is not in a disputable state")]
    InvoiceNotDisputable,
    #[msg("Invoice is not overdue yet")]
    InvoiceNotOverdue,
    #[msg("String exceeds maximum length")]
    StringTooLong,
    #[msg("VAT ID is required")]
    MissingVatId,
    #[msg("Currency must be specified")]
    MissingCurrency,
    #[msg("Company already registered for this authority")]
    CompanyAlreadyRegistered,
    #[msg("Only the invoice issuer can record tax")]
    UnauthorizedTaxRecorder,
    #[msg("Tax has already been recorded for this invoice")]
    TaxAlreadyRecorded,
    #[msg("IPFS hash is required")]
    MissingIpfsHash,
}

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum InvoiceStatus {
    Draft,
    Pending,
    Paid,
    Overdue,
    Disputed,
}

// ─────────────────────────────────────────────────────────────
// Account Structs
// ─────────────────────────────────────────────────────────────

#[account]
pub struct Invoice {
    pub invoice_id: String,
    pub issuer: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub currency: String,
    pub tax_amount: u64,
    pub tax_rate: u16,
    pub status: InvoiceStatus,
    pub created_at: i64,
    pub due_date: i64,
    pub ipfs_hash: String,
    pub vat_id_issuer: String,
    pub vat_id_payer: String,
    pub bump: u8,
}

impl Invoice {
    pub fn space(
        invoice_id_len: usize,
        currency_len: usize,
        ipfs_hash_len: usize,
        vat_id_issuer_len: usize,
        vat_id_payer_len: usize,
    ) -> usize {
        DISCRIMINATOR_SIZE
            + 4 + invoice_id_len
            + 32
            + 32
            + 8
            + 4 + currency_len
            + 8
            + 2
            + 1 + 1
            + 8
            + 8
            + 4 + ipfs_hash_len
            + 4 + vat_id_issuer_len
            + 4 + vat_id_payer_len
            + 1
    }
}

#[account]
pub struct Company {
    pub authority: Pubkey,
    pub name: String,
    pub vat_id: String,
    pub country: String,
    pub wallet_address: Pubkey,
    pub bump: u8,
}

impl Company {
    pub fn space(name_len: usize, vat_id_len: usize, country_len: usize) -> usize {
        DISCRIMINATOR_SIZE
            + 32
            + 4 + name_len
            + 4 + vat_id_len
            + 4 + country_len
            + 32
            + 1
    }
}

#[account]
pub struct TaxPaymentRecord {
    pub invoice: Pubkey,
    pub recorder: Pubkey,
    pub tax_amount: u64,
    pub tax_rate: u16,
    pub currency: String,
    pub reference: String,
    pub paid_at: i64,
    pub bump: u8,
}

impl TaxPaymentRecord {
    pub fn space(currency_len: usize, reference_len: usize) -> usize {
        DISCRIMINATOR_SIZE
            + 32
            + 32
            + 8
            + 2
            + 4 + currency_len
            + 4 + reference_len
            + 8
            + 1
    }
}

// ─────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────

#[event]
pub struct InvoiceCreated {
    pub invoice_id: String,
    pub issuer: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub currency: String,
    pub tax_amount: u64,
    pub tax_rate: u16,
    pub due_date: i64,
}

#[event]
pub struct InvoicePaid {
    pub invoice_id: String,
    pub issuer: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub tax_amount: u64,
    pub paid_at: i64,
}

#[event]
pub struct TaxPaymentRecorded {
    pub invoice: Pubkey,
    pub tax_amount: u64,
    pub tax_rate: u16,
    pub reference: String,
    pub paid_at: i64,
}

// ─────────────────────────────────────────────────────────────
// Program
// ─────────────────────────────────────────────────────────────

#[program]
pub mod vellum_contract {
    use super::*;

    // ── RegisterCompany ──

    #[derive(Accounts)]
    #[instruction(name: String, vat_id: String, country: String)]
    pub struct RegisterCompany<'info> {
        #[account(
            init,
            payer = authority,
            space = Company::space(name.len(), vat_id.len(), country.len()),
            seeds = [b"company", authority.key().as_ref()],
            bump,
        )]
        pub company: Account<'info, Company>,

        #[account(mut)]
        pub authority: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    pub fn register_company(
        ctx: Context<RegisterCompany>,
        name: String,
        vat_id: String,
        country: String,
        wallet_address: Pubkey,
    ) -> Result<()> {
        require!(name.len() > 0 && name.len() <= 64, VellumError::StringTooLong);
        require!(vat_id.len() > 0 && vat_id.len() <= 20, VellumError::StringTooLong);
        require!(country.len() == 2, VellumError::StringTooLong);

        let company = &mut ctx.accounts.company;
        company.authority = ctx.accounts.authority.key();
        company.name = name;
        company.vat_id = vat_id;
        company.country = country;
        company.wallet_address = wallet_address;
        company.bump = ctx.bumps.company;

        Ok(())
    }

    // ── CreateInvoice ──

    #[derive(Accounts)]
    #[instruction(
        invoice_id: String,
        payer: Pubkey,
        amount: u64,
        currency: String,
        tax_amount: u64,
        tax_rate: u16,
        due_date: i64,
        ipfs_hash: String,
        vat_id_issuer: String,
        vat_id_payer: String,
    )]
    pub struct CreateInvoice<'info> {
        #[account(
            init,
            payer = issuer,
            space = Invoice::space(
                invoice_id.len(),
                currency.len(),
                ipfs_hash.len(),
                vat_id_issuer.len(),
                vat_id_payer.len(),
            ),
            seeds = [b"invoice", invoice_id.as_bytes()],
            bump,
        )]
        pub invoice: Account<'info, Invoice>,

        /// CHECK: Payer of the invoice (not the transaction payer). Validated in handler.
        pub payer_account: AccountInfo<'info>,

        #[account(mut)]
        pub issuer: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        invoice_id: String,
        payer: Pubkey,
        amount: u64,
        currency: String,
        tax_amount: u64,
        tax_rate: u16,
        due_date: i64,
        ipfs_hash: String,
        vat_id_issuer: String,
        vat_id_payer: String,
    ) -> Result<()> {
        require!(amount > 0, VellumError::InvalidAmount);
        require!(invoice_id.len() > 0 && invoice_id.len() <= 32, VellumError::StringTooLong);
        require!(currency.len() > 0 && currency.len() <= 8, VellumError::MissingCurrency);
        require!(ipfs_hash.len() > 0 && ipfs_hash.len() <= 64, VellumError::MissingIpfsHash);
        require!(vat_id_issuer.len() > 0 && vat_id_issuer.len() <= 20, VellumError::MissingVatId);
        require!(vat_id_payer.len() > 0 && vat_id_payer.len() <= 20, VellumError::MissingVatId);

        let clock = Clock::get()?;
        require!(due_date > clock.unix_timestamp, VellumError::DueDateInPast);

        require!(
            ctx.accounts.payer_account.key() == payer,
            VellumError::UnauthorizedPayer
        );

        let invoice = &mut ctx.accounts.invoice;
        invoice.invoice_id = invoice_id.clone();
        invoice.issuer = ctx.accounts.issuer.key();
        invoice.payer = payer;
        invoice.amount = amount;
        invoice.currency = currency.clone();
        invoice.tax_amount = tax_amount;
        invoice.tax_rate = tax_rate;
        invoice.status = InvoiceStatus::Pending;
        invoice.created_at = clock.unix_timestamp;
        invoice.due_date = due_date;
        invoice.ipfs_hash = ipfs_hash;
        invoice.vat_id_issuer = vat_id_issuer;
        invoice.vat_id_payer = vat_id_payer;
        invoice.bump = ctx.bumps.invoice;

        emit!(InvoiceCreated {
            invoice_id: invoice.invoice_id.clone(),
            issuer: invoice.issuer,
            payer: invoice.payer,
            amount: invoice.amount,
            currency: invoice.currency.clone(),
            tax_amount: invoice.tax_amount,
            tax_rate: invoice.tax_rate,
            due_date: invoice.due_date,
        });

        Ok(())
    }

    // ── PayInvoice ──

    #[derive(Accounts)]
    pub struct PayInvoice<'info> {
        #[account(
            mut,
            constraint = invoice.status == InvoiceStatus::Pending @ VellumError::InvoiceNotPayable,
            constraint = invoice.payer == payer.key() @ VellumError::UnauthorizedPayer,
        )]
        pub invoice: Account<'info, Invoice>,

        #[account(mut)]
        pub payer: Signer<'info>,

        #[account(mut)]
        pub payer_token_account: Account<'info, TokenAccount>,

        #[account(mut)]
        pub issuer_token_account: Account<'info, TokenAccount>,

        pub token_program: Program<'info, Token>,

        pub system_program: Program<'info, System>,
    }

    pub fn pay_invoice(ctx: Context<PayInvoice>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.issuer_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            invoice.amount,
        )?;

        let clock = Clock::get()?;
        invoice.status = InvoiceStatus::Paid;

        emit!(InvoicePaid {
            invoice_id: invoice.invoice_id.clone(),
            issuer: invoice.issuer,
            payer: invoice.payer,
            amount: invoice.amount,
            tax_amount: invoice.tax_amount,
            paid_at: clock.unix_timestamp,
        });

        Ok(())
    }

    // ── DisputeInvoice ──

    #[derive(Accounts)]
    pub struct DisputeInvoice<'info> {
        #[account(
            mut,
            constraint = invoice.status == InvoiceStatus::Pending @ VellumError::InvoiceNotDisputable,
            constraint = invoice.payer == disputer.key() @ VellumError::UnauthorizedDisputer,
        )]
        pub invoice: Account<'info, Invoice>,

        pub disputer: Signer<'info>,
    }

    pub fn dispute_invoice(ctx: Context<DisputeInvoice>, _reason: String) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        invoice.status = InvoiceStatus::Disputed;
        Ok(())
    }

    // ── MarkOverdue ──

    #[derive(Accounts)]
    pub struct MarkOverdue<'info> {
        #[account(
            mut,
            constraint = invoice.status == InvoiceStatus::Pending @ VellumError::InvoiceNotOverdue,
        )]
        pub invoice: Account<'info, Invoice>,
    }

    pub fn mark_overdue(ctx: Context<MarkOverdue>) -> Result<()> {
        let clock = Clock::get()?;
        let invoice = &mut ctx.accounts.invoice;

        require!(
            clock.unix_timestamp > invoice.due_date,
            VellumError::InvoiceNotOverdue
        );

        invoice.status = InvoiceStatus::Overdue;
        Ok(())
    }

    // ── RecordTaxPayment ──

    #[derive(Accounts)]
    #[instruction(currency: String, reference: String)]
    pub struct RecordTaxPayment<'info> {
        #[account(
            constraint = invoice.issuer == recorder.key() @ VellumError::UnauthorizedTaxRecorder,
        )]
        pub invoice: Account<'info, Invoice>,

        #[account(
            init,
            payer = recorder,
            space = TaxPaymentRecord::space(currency.len(), reference.len()),
            seeds = [b"tax_payment", invoice.key().as_ref()],
            bump,
        )]
        pub tax_payment_record: Account<'info, TaxPaymentRecord>,

        #[account(mut)]
        pub recorder: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    pub fn record_tax_payment(
        ctx: Context<RecordTaxPayment>,
        currency: String,
        reference: String,
    ) -> Result<()> {
        let invoice = &ctx.accounts.invoice;
        let tax_payment = &mut ctx.accounts.tax_payment_record;

        tax_payment.invoice = invoice.key();
        tax_payment.recorder = ctx.accounts.recorder.key();
        tax_payment.tax_amount = invoice.tax_amount;
        tax_payment.tax_rate = invoice.tax_rate;
        tax_payment.currency = currency.clone();
        tax_payment.reference = reference.clone();
        tax_payment.paid_at = Clock::get()?.unix_timestamp;
        tax_payment.bump = ctx.bumps.tax_payment_record;

        emit!(TaxPaymentRecorded {
            invoice: invoice.key(),
            tax_amount: invoice.tax_amount,
            tax_rate: invoice.tax_rate,
            reference,
            paid_at: tax_payment.paid_at,
        });

        Ok(())
    }
}
