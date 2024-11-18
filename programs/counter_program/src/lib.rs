use anchor_lang::prelude::*;

declare_id!("29yhZZKFaQuwR8qj7Kgaow3f9ptwxGV7QEoEYxsqFiVQ");

#[program]
pub mod counter_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        start: u64,
        step: u64,
        admin: Pubkey,
    ) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = start;
        counter.step = step;
        counter.admin = admin;
        counter.fee_payer = ctx.accounts.fee_payer.key();
        Ok(())
    }

    pub fn increment(ctx: Context<CounterWrite>) -> Result<u64> {
        let counter = &mut ctx.accounts.counter;
        counter.count += counter.step;
        Ok(counter.count)
    }

    pub fn decrement(ctx: Context<CounterWrite>) -> Result<u64> {
        let counter = &mut ctx.accounts.counter;
        counter.count -= counter.step;
        Ok(counter.count)
    }

    pub fn reset_amdin(ctx: Context<ResetAdmin>, new_admin: Pubkey) -> Result<()> {
        // 权限检查, 只允许admin账户执行.
        // ctx.accounts.admin是额外的签名者, 用于验证签名和权限控制.

        require!(
            ctx.accounts.counter.admin == ctx.accounts.admin.key(),
            CounterErr::AdminCheckFailed
        );

        let counter = &mut ctx.accounts.counter;
        counter.admin = new_admin;

        Ok(())
    }

    pub fn get_count(ctx: Context<CounterRead>) -> Result<u64> {
        let count: u64 = ctx.accounts.counter.count;

        Ok(count)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // 前八个字节是默认的账户标识符占用空间. 最后8个字节为保留保护空间.
    // Counter::INIT_SPACE表示计算Counter类型占用的基础空间, 也可以通过std::mem::size_of::<Counter>()计算.
    #[account(init, payer = fee_payer, space = 8 + Counter::INIT_SPACE + 8 )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub fee_payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CounterWrite<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct CounterRead<'info> {
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct ResetAdmin<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

// Counter表示实际存储的数据/数据账户.
#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
    pub step: u64,
    pub admin: Pubkey,
    pub fee_payer: Pubkey,
}

#[error_code]
pub enum CounterErr {
    #[msg("The admin account check failed.")]
    AdminCheckFailed,
}
