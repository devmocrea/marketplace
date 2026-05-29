# Magic Wallet Integration

## Overview

This document describes the implementation of Magic.link wallet abstraction for Afristore, enabling non-crypto-native users to create and manage wallets using email or passkey authentication.

## Features

- **Email Magic Links**: Users receive a secure link via email to authenticate
- **Passkey Support**: FaceID, fingerprint, or platform-specific biometric authentication
- **Stellar Integration**: Magic wallets are mapped to Stellar keypairs for blockchain transactions
- **Non-custodial**: Users maintain control of their private keys through Magic's secure infrastructure
- **Seamless UX**: No seed phrases or complex wallet setup required

## Architecture

### Components

#### 1. **Magic Library** (`src/lib/magic.ts`)
Core Magic SDK integration providing:
- `getMagicInstance()`: Singleton Magic instance
- `loginWithMagicLink(email)`: Email-based authentication
- `loginWithPasskey()`: Biometric authentication
- `getMagicUserMetadata()`: Retrieve user account info
- `logoutFromMagic()`: Secure logout
- `signWithMagic(txXdr)`: Sign Stellar transactions

#### 2. **useMagicWallet Hook** (`src/hooks/useMagicWallet.ts`)
React hook managing Magic wallet state:
- `status`: Connection state (NOT_INITIALIZED, DISCONNECTED, CONNECTING, CONNECTED, ERROR)
- `email`: User's email address
- `publicAddress`: Stellar public key
- `loginWithEmail()`: Initiate email login
- `loginWithPasskey()`: Initiate passkey login
- `logout()`: Disconnect wallet
- `refresh()`: Check login status

#### 3. **MagicWalletModal** (`src/components/MagicWalletModal.tsx`)
UI component for Magic wallet onboarding:
- Email input form with magic link flow
- Passkey authentication button
- Success confirmation screen
- Error handling and user feedback

#### 4. **Updated ConnectWalletModal** (`src/components/ConnectWalletModal.tsx`)
Enhanced wallet selection modal now includes:
- Freighter Wallet (existing)
- Magic Wallet (new)
- Seamless switching between wallet types

## Setup Instructions

### 1. Get Magic API Key

1. Visit [Magic Dashboard](https://dashboard.magic.link)
2. Sign up or log in
3. Create a new application
4. Copy your **Publishable API Key**

### 2. Configure Environment

Add to `.env.local`:

```env
NEXT_PUBLIC_MAGIC_API_KEY=pk_live_xxxxxxxxxxxxx
```

Or update `.env.example` (already done):

```env
NEXT_PUBLIC_MAGIC_API_KEY=
```

### 3. Install Dependencies

Magic SDK is already installed:

```bash
npm install magic-sdk @magic-sdk/admin
```

### 4. Test Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to wallet connection flow
3. Click "Magic Wallet" button
4. Test email login or passkey authentication

## Usage

### For Users

1. **Email Login**:
   - Click "Magic Wallet" → "Email Magic Link"
   - Enter email address
   - Check email for magic link
   - Click link to authenticate
   - Wallet is ready to use

2. **Passkey Login**:
   - Click "Magic Wallet" → "Passkey Login"
   - Use biometric authentication (FaceID, fingerprint, etc.)
   - Wallet is ready to use

### For Developers

#### Using Magic Wallet in Components

```typescript
import { useMagicWallet } from "@/hooks/useMagicWallet";

export function MyComponent() {
  const { publicAddress, isConnected, loginWithEmail } = useMagicWallet();

  if (isConnected) {
    return <p>Connected: {publicAddress}</p>;
  }

  return (
    <button onClick={() => loginWithEmail("user@example.com")}>
      Connect with Magic
    </button>
  );
}
```

#### Signing Transactions

```typescript
import { signWithMagic } from "@/lib/magic";

async function submitTransaction(txXdr: string) {
  try {
    const signedXdr = await signWithMagic(txXdr);
    // Submit signed transaction to Stellar network
  } catch (error) {
    console.error("Transaction signing failed:", error);
  }
}
```

## Security Considerations

1. **API Key Protection**:
   - `NEXT_PUBLIC_MAGIC_API_KEY` is intentionally public (client-side only)
   - Never expose server-side secrets in client code
   - Magic handles all sensitive operations server-side

2. **Transaction Signing**:
   - Users must approve each transaction
   - Magic provides secure signing without exposing private keys
   - All cryptographic operations happen in Magic's secure environment

3. **Session Management**:
   - Magic handles session tokens securely
   - Tokens are stored in secure, httpOnly cookies
   - Automatic session refresh on page reload

4. **Email Verification**:
   - Magic links expire after 10 minutes
   - One-time use only
   - Sent to verified email addresses

## Stellar Integration

### Keypair Mapping

Magic creates a unique Stellar keypair for each user:
- **Public Key**: Derived from user's Magic account
- **Private Key**: Securely stored in Magic's infrastructure
- **Network**: Testnet or Mainnet (configurable)

### Transaction Flow

1. User initiates transaction in Afristore
2. Transaction XDR is created
3. User approves signing in Magic modal
4. Magic signs with user's Stellar keypair
5. Signed transaction submitted to Stellar network

## Testing

### Unit Tests

```bash
npm run test
```

### Manual Testing Checklist

- [ ] Email login flow works
- [ ] Passkey login works (if device supports)
- [ ] User metadata displays correctly
- [ ] Logout clears session
- [ ] Transaction signing works
- [ ] Error handling displays properly
- [ ] Modal closes on successful connection
- [ ] Switching between Freighter and Magic works

## Troubleshooting

### Magic API Key Not Set

**Error**: "Magic SDK not initialized. Please set NEXT_PUBLIC_MAGIC_API_KEY."

**Solution**: 
1. Verify `.env.local` has `NEXT_PUBLIC_MAGIC_API_KEY`
2. Restart dev server after adding env var
3. Check Magic Dashboard for correct API key

### Email Link Not Received

**Possible Causes**:
- Email in spam folder
- Typo in email address
- Magic link expired (10 min timeout)

**Solution**:
- Check spam/promotions folder
- Verify email address spelling
- Request new magic link

### Passkey Not Available

**Cause**: Device doesn't support WebAuthn

**Solution**:
- Use email magic link instead
- Update browser to latest version
- Use supported device (most modern phones/laptops)

### Transaction Signing Fails

**Possible Causes**:
- User rejected signing
- Invalid transaction XDR
- Network mismatch

**Solution**:
- Check transaction details
- Verify network configuration
- Ensure user approves signing

## Future Enhancements

1. **Multi-chain Support**: Extend to other blockchains
2. **Social Login**: Google, GitHub, Discord authentication
3. **Recovery Codes**: Backup authentication methods
4. **Account Linking**: Connect multiple wallets to one account
5. **Transaction History**: View all Magic wallet transactions
6. **Custom Branding**: White-label Magic experience

## References

- [Magic.link Documentation](https://magic.link/docs)
- [Magic SDK Reference](https://magic.link/docs/sdk)
- [Stellar Documentation](https://developers.stellar.org)
- [Freighter Wallet](https://www.freighter.app)

## Support

For issues or questions:
1. Check Magic Dashboard logs
2. Review browser console for errors
3. Consult Magic support: support@magic.link
4. Open issue on Afristore GitHub

## Changelog

### v1.0.0 (2026-04-29)

- Initial Magic wallet integration
- Email magic link authentication
- Passkey/biometric support
- Stellar transaction signing
- ConnectWalletModal integration
- Comprehensive documentation
