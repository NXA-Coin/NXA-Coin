# NXA-Coin (NXA)

> **The utility token of the Nxvana AI ecosystem.**
> Built on Solana. 1B fixed supply. Permissionless. Locked.

---

## 🎯 Status: MAINNET READY — AWAITING DEPLOYMENT

| Property | Value |
|----------|-------|
| **Name** | NXA-Coin |
| **Symbol** | NXA |
| **Network** | Solana **Mainnet-Beta** |
| **Mint Address** | *(generated on launch day — run `npm run 3:create`)* |
| **Decimals** | 9 |
| **Total Supply** | 1,000,000,000 NXA (fixed forever) |
| **Mint Authority** | Revoked at launch ✅ |
| **Freeze Authority** | Revoked at launch ✅ |
| **Metadata** | Metaplex Token Metadata v3 — hosted on GitHub ✅ |
| **Metadata URI** | `https://raw.githubusercontent.com/NXA-Coin/nxa-coin/main/metadata/nxa-token.json` |
| **Deployer Wallet** | `G4KKx3KHndrzQG38FGG7XRt2iBcN7geRVsz7B3jcNBAD` |
| **Founder** | Leon Kasirai Kujinga |

> 🔗 Explorer link will be live once `npm run verify` completes on launch day.

---

## Project Structure

```
NXA-Coin/
├── calculator/
│   └── index.html              # Investor allocation calculator (open in browser)
├── scripts/
│   ├── _shared.js              # Common helpers
│   ├── 1-generate-keypair.js   # Create deployer wallet
│   ├── 2-airdrop.js            # Get devnet SOL for fees
│   ├── 3-create-token.js       # Create the SPL token mint
│   ├── 4-mint-supply.js        # Mint 1B NXA to deployer
│   ├── 5-add-metadata.js       # Attach Metaplex metadata (MUST run before lock)
│   ├── 6-lock-authorities.js   # Revoke mint + freeze authority (irreversible)
│   └── verify.js               # Final on-chain audit
├── metadata/
│   └── nxa-token.json          # Off-chain token metadata (logo, description)
├── keys/
│   └── deployer.json           # Keypair file — KEEP SAFE, NEVER COMMIT
├── config.json                 # Network config + deployment state
└── package.json
```

## 🚀 LAUNCH DAY — Step-by-Step Checklist

> ⚠️ **Order is everything.** Do not skip steps. Do not run them out of order.
> The only terminal window you need is in `C:\Users\User\Documents\NXA-Coin`

| # | What to do | Command / Action | What happens | What to save / check |
|---|---|---|---|---|
| **PRE-1** | Open terminal in NXA-Coin folder | Right-click folder → Open in Terminal | Ready to run scripts | — |
| **PRE-2** | Check SOL balance in Phantom | Open Phantom wallet | Must show at least **0.05 SOL** | If less than 0.05 SOL — stop, fund first |
| **PRE-3** | Send SOL to deployer wallet | Send from Phantom to `G4KKx3KHndrzQG38FGG7XRt2iBcN7geRVsz7B3jcNBAD` | SOL arrives in deployer | Confirm balance on Solscan before continuing |
| **1** | Create the token mint on Solana | `npm run 3:create` | NXA-Coin is **born on mainnet** — permanent address generated | 🔴 **COPY the Mint Address printed** — paste it somewhere safe immediately |
| **2** | Mint 1 billion NXA to your wallet | `npm run 4:mint` | 1,000,000,000 NXA lands in deployer wallet | Script confirms supply ✅ |
| **3** | Attach name, logo & metadata on-chain | `npm run 5:metadata` | Metaplex writes NXA-Coin name + GitHub logo URL to blockchain | Script confirms metadata added ✅ |
| **4** | 🔒 LOCK — revoke all authorities | `npm run 6:lock` | Prompts you to type **LOCK** | Type `LOCK` and press Enter — **this is irreversible, supply is fixed forever** |
| **5** | Run final audit | `npm run verify` | Reads everything on-chain, prints full report | Confirm: Mint Authority = `null` ✅  Freeze Authority = `null` ✅  Supply = 1,000,000,000 ✅ |
| **6** | Copy your Explorer links | From `verify` output | Two URLs printed — Mint and Wallet | Copy the **Mint** URL — this is your proof link |
| **7** | List on Pump.fun | Go to [pump.fun](https://pump.fun) → Create Coin | Paste your Mint Address | Set name: NXA-Coin, symbol: NXA, add logo |
| **8** | Seed buy on Pump.fun | Buy $5–10 of NXA from the bonding curve | Starts the price curve | Keeps the listing alive and shows early demand |
| **9** | Fire the launch tweet | Copy thread from `NXA-Launch/the-new-unveiling.md` | Paste Mint link + Pump.fun link into Tweet 4 | Post all 5 tweets as a thread from @NxvanaAI |
| **10** | Send mint address to Jena | WhatsApp the Mint address + Solscan link | He can verify on-chain before sending funds | Done ✅ |

> ✅ **After Step 10 — NXA-Coin is live, verified, listed, and Jena can independently confirm it on-chain.**

---

## Token Distribution (Tokenomics)

| Allocation | % | NXA | Vesting |
|------------|---|-----|---------|
| Public Sale (Liquidity Pool) | 40% | 400,000,000 | Immediate |
| Founder & Development | 20% | 200,000,000 | 12-month linear |
| Ecosystem & Rewards | 15% | 150,000,000 | Released as features ship |
| Marketing & Partnerships | 10% | 100,000,000 | 6-month cliff, 12-month vest |
| Early Investors | 10% | 100,000,000 | 3-month cliff, 6-month vest |
| Reserve / Treasury | 5% | 50,000,000 | DAO-governed |

---

## Config Status ✅ MAINNET CONFIGURED

| Setting | Value | Status |
|---|---|---|
| Network | `mainnet-beta` | ✅ Set |
| RPC URL | `https://api.mainnet-beta.solana.com` | ✅ Set |
| Metadata URI | GitHub raw URL (nxa-token.json) | ✅ Set |
| Deployer wallet | `G4KKx3KHndrzQG38FGG7XRt2iBcN7geRVsz7B3jcNBAD` | ✅ Set |
| Mint Address | *(blank — generated on launch day)* | ⏳ Pending SOL |
| Supply Minted | false | ⏳ Pending |
| Authorities Revoked | false | ⏳ Pending |

## Lessons Learned

- **First devnet attempt** (mint `8mYhwQ...`) failed metadata because authorities were locked first. Order corrected.
- The Solana public devnet faucet is unreliable — use https://faucet.solana.com (GitHub auth) or QuickNode faucet.
- `bigint` native binding warning is harmless on Windows — pure JS fallback works fine.

---

## Allocation Calculator

Open `calculator/index.html` in any browser. Standalone, no server needed. Use it for:
- Modeling investor deals at any price stage
- Quick USD ↔ NXA conversion
- Tracking the Early Investors pool (100M cap)
- Print-friendly deal sheets for negotiations

---

**Built by Leon Kasirai Kujinga · Founder & CEO, Nxvana AI · 2026**
