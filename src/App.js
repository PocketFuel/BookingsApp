import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import ProductivityApp from './ProductivityApp'; // Import the ProductivityApp component

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={{
            backgroundColor: '#191919',
            color: '#ffffff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}>
            <AppContent />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function AppContent() {
  const { connected } = useWallet();

  return (
    <>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffff' }}>Solana NFT Minter</h1>
      <WalletMultiButton />
      {connected ? (
        <ProductivityApp />
      ) : (
        <p style={{ marginTop: '24px', color: '#e0e0e0' }}>Connect your wallet to access the Productivity App</p>
      )}
    </>
  );
}

export default App;
