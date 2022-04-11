import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import {
    Program, Provider, web3, BN
} from '@project-serum/anchor';

import idl from './idl.json';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();
    const baseAccount = web3.Keypair.generate();

    function getProvider() {
        if ( !wallet ) {
            return null;
        }
        /* create the provider and return to the caller*/
        /* network set to the local network */
        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");
        const provider = new Provider(connection, wallet, {"preflightCommitment": "processed"},);

        return provider;
    }

    async function createCounter() {
        const provider = getProvider()

        if (!provider) {
            throw("Provider is null");
        }
        /* create the program interface combing the idl, program ID and provider */
        // bug with default importing when handel the string value types, fixed by re-converting to json
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);

        const program = new Program(b, idl.metadata.address, provider);
        try {
            // interact with program via RPC
            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log("account: ", account);
        } catch(error) {
            console.log("Transaction err: ", error)
        }
    }
    async function increment() {
        const provider = getProvider()
    
        if (!provider) {
            throw("Provider is null");
        }
        /* create the program interface combing the idl, program ID and provider */
        // bug with default importing when handel the string value types, fixed by re-converting to json
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);

        const program = new Program(b, idl.metadata.address, provider);
        try {
            // interact with program via RPC
            await program.rpc.increment({
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            });
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log("account: ", account.data.toString());
        } catch(error) {
            console.log("Transaction err: ", error)
        }
    }
    async function decrement() {
        const provider = getProvider()
    
        if (!provider) {
            throw("Provider is null");
        }
        /* create the program interface combing the idl, program ID and provider */
        // bug with default importing when handel the string value types, fixed by re-converting to json
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);

        const program = new Program(b, idl.metadata.address, provider);
        try {
            // interact with program via RPC
            await program.rpc.decrement({
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            });
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log("account: ", account.data.toString());
        } catch(error) {
            console.log("Transaction err: ", error)
        }
    }
    async function update() {
        const provider = getProvider()
    
        if (!provider) {
            throw("Provider is null");
        }
        /* create the program interface combing the idl, program ID and provider */
        // bug with default importing when handel the string value types, fixed by re-converting to json
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);

        const program = new Program(b, idl.metadata.address, provider);
        try {
            // interact with program via RPC
            await program.rpc.update(new BN(100), {
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            });
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log("account: ", account.data.toString());
        } catch(error) {
            console.log("Transaction err: ", error)
        }
    }

    return (
        <div className="App">
            <button onClick={createCounter}>Initialize</button>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
            <button onClick={update}>Update</button>
            <WalletMultiButton />
        </div>
    );
};
