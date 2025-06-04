import {
    AccountClient,
    AnchorError,
    AnchorProvider,
    BN,
    Program,
    setProvider,
    web3,
    workspace,
} from '@coral-xyz/anchor';
import { CounterProgram } from '../target/types/counter_program';
import { assert, expect } from 'chai';

describe('counter_program', () => {
    // Configure the client to use the local cluster.
    setProvider(AnchorProvider.env());

    let program: Program<CounterProgram>;
    let dataAccount1: web3.Keypair;
    let wallet1: web3.Keypair;
    let wallet2: web3.Keypair;
    let latestBlockhash: Awaited<
        ReturnType<web3.Connection['getLatestBlockhash']>
    >;
    let counter: {
        count: BN;
        step: BN;
        admin: web3.PublicKey;
        feePayer: web3.PublicKey;
    };
    let count: number;

    beforeEach(async () => {
        program = workspace.CounterProgram as Program<CounterProgram>;

        dataAccount1 = web3.Keypair.generate();
        wallet1 = web3.Keypair.generate();
        wallet2 = web3.Keypair.generate();
        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const airdropTx1 = await program.provider.connection.requestAirdrop(
            wallet1.publicKey,
            web3.LAMPORTS_PER_SOL,
        );
        await program.provider.connection.confirmTransaction({
            signature: airdropTx1,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const airdropTx2 = await program.provider.connection.requestAirdrop(
            wallet1.publicKey,
            web3.LAMPORTS_PER_SOL,
        );
        await program.provider.connection.confirmTransaction({
            signature: airdropTx2,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const start1 = new BN(10000);
        const step1 = new BN(5);
        const tx1 = await program.methods
            .initialize(start1, step1, wallet2.publicKey)
            .accounts({
                counter: dataAccount1.publicKey,
                feePayer: wallet1.publicKey,
            })
            .signers([dataAccount1, wallet1])
            .rpc();
        const confirm1 = await program.provider.connection.confirmTransaction({
            signature: tx1,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        assert.equal(confirm1.value.err, null);

        count = (
            await program.methods
                .getCount()
                .accounts({
                    counter: dataAccount1.publicKey,
                })
                .view()
        ).toNumber();
        counter = await program.account.counter.fetch(dataAccount1.publicKey);
        assert.equal(count, 10000);
        assert.equal(counter.count.toNumber(), 10000);
        assert.equal(counter.step.toNumber(), 5);
        assert.equal(counter.feePayer.toString(), wallet1.publicKey.toString());
        assert.equal(counter.admin.toString(), wallet2.publicKey.toString());
    });

    it('Counter operator test1!', async () => {
        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const tx1 = await program.methods
            .increment()
            .accounts({
                counter: dataAccount1.publicKey,
            })
            .signers([])
            .rpc();
        const confirm1 = await program.provider.connection.confirmTransaction({
            signature: tx1,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        assert.equal(confirm1.value.err, null);

        count = (
            await program.methods
                .getCount()
                .accounts({
                    counter: dataAccount1.publicKey,
                })
                .view()
        ).toNumber();
        counter = await program.account.counter.fetch(dataAccount1.publicKey);
        assert.equal(count, 10005);
        assert.equal(counter.count.toNumber(), 10005);
        assert.equal(counter.step.toNumber(), 5);
        assert.equal(counter.feePayer.toString(), wallet1.publicKey.toString());
        assert.equal(counter.admin.toString(), wallet2.publicKey.toString());

        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const tx2 = await program.methods
            .decrement()
            .accounts({
                counter: dataAccount1.publicKey,
            })
            .signers([])
            .rpc();
        const confirm2 = await program.provider.connection.confirmTransaction({
            signature: tx2,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        assert.equal(confirm2.value.err, null);

        count = (
            await program.methods
                .getCount()
                .accounts({
                    counter: dataAccount1.publicKey,
                })
                .view()
        ).toNumber();
        counter = await program.account.counter.fetch(dataAccount1.publicKey);
        assert.equal(count, 10000);
        assert.equal(counter.count.toNumber(), 10000);
        assert.equal(counter.step.toNumber(), 5);
        assert.equal(counter.feePayer.toString(), wallet1.publicKey.toString());
        assert.equal(counter.admin.toString(), wallet2.publicKey.toString());
    });

    it('Reset admin test1!', async () => {
        latestBlockhash =
            await program.provider.connection.getLatestBlockhash('confirmed');
        const tx1 = await program.methods
            .resetAmdin(wallet1.publicKey)
            .accounts({
                counter: dataAccount1.publicKey,
                admin: wallet2.publicKey,
            })
            .signers([wallet2])
            .rpc();
        const confirm1 = await program.provider.connection.confirmTransaction({
            signature: tx1,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        assert.equal(confirm1.value.err, null);

        count = (
            await program.methods
                .getCount()
                .accounts({
                    counter: dataAccount1.publicKey,
                })
                .view()
        ).toNumber();
        counter = await program.account.counter.fetch(dataAccount1.publicKey);
        assert.equal(count, 10000);
        assert.equal(counter.count.toNumber(), 10000);
        assert.equal(counter.step.toNumber(), 5);
        assert.equal(counter.feePayer.toString(), wallet1.publicKey.toString());
        assert.equal(counter.admin.toString(), wallet1.publicKey.toString());

        try {
            latestBlockhash =
                await program.provider.connection.getLatestBlockhash(
                    'confirmed',
                );
            const _tx2 = await program.methods
                .resetAmdin(wallet1.publicKey)
                .accounts({
                    counter: dataAccount1.publicKey,
                    admin: wallet2.publicKey,
                })
                .signers([wallet2])
                .rpc();

            assert.fail('Reset admin test failed');
        } catch (err) {
            assert.isTrue(
                err instanceof AnchorError &&
                    err.error.errorCode.code === 'AdminCheckFailed',
                'Reset admin test failed',
            );
        }
    });

    it('Repeat the initialization test1!', async () => {
        try {
            latestBlockhash =
                await program.provider.connection.getLatestBlockhash(
                    'confirmed',
                );
            const start2 = new BN(20000);
            const step2 = new BN(10);
            const _tx1 = await program.methods
                .initialize(start2, step2, wallet2.publicKey)
                .accounts({
                    counter: dataAccount1.publicKey,
                    feePayer: wallet1.publicKey,
                })
                .signers([dataAccount1, wallet1])
                .rpc();

            assert.fail('Repeat the initialization test failed');
        } catch (err) {
            console.log(err);
        }
    });
});
