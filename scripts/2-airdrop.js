/**
 * STEP 2 — Airdrop devnet SOL to the deployer.
 *
 * Devnet faucet gives free SOL for testing. We need ~0.05 SOL total:
 *   • ~0.0014 SOL to create the mint account
 *   • ~0.002 SOL to create the associated token account
 *   • ~0.01 SOL for Metaplex metadata
 *   • Remainder = buffer for retries
 *
 * Solana devnet rate-limits airdrops to ~2 SOL per request.
 * If this fails (rate limit), try https://faucet.solana.com manually.
 */
const { LAMPORTS_PER_SOL } = require("@solana/web3.js");
const {
  banner, ok, info, warn, err, dim, bold, c,
  getConnection, loadDeployer, loadConfig,
} = require("./_shared");

const TARGET_SOL = 2;

(async () => {
  banner("STEP 2 — AIRDROP DEVNET SOL");

  const cfg = loadConfig();
  if (cfg.network !== "devnet") {
    err(`Network is set to '${cfg.network}'. Airdrop only works on devnet.`);
    err(`Set network to 'devnet' in config.json to proceed.`);
    process.exit(1);
  }

  const conn = getConnection();
  const deployer = loadDeployer();

  info(`Deployer: ${deployer.publicKey.toBase58()}`);
  info(`Network:  ${cfg.network}`);
  info(`RPC URL:  ${cfg.rpcUrl}`);
  console.log();

  // Check current balance first
  const startBalance = await conn.getBalance(deployer.publicKey);
  info(`Current balance: ${(startBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  if (startBalance >= TARGET_SOL * LAMPORTS_PER_SOL) {
    ok(`Already have enough SOL (≥ ${TARGET_SOL} SOL). Skipping airdrop.`);
    process.exit(0);
  }

  console.log();
  info(`Requesting ${TARGET_SOL} SOL airdrop from devnet faucet...`);

  try {
    const signature = await conn.requestAirdrop(
      deployer.publicKey,
      TARGET_SOL * LAMPORTS_PER_SOL
    );
    dim(`  TX signature: ${signature}`);
    info("Waiting for confirmation...");
    await conn.confirmTransaction(signature, "confirmed");

    const newBalance = await conn.getBalance(deployer.publicKey);
    ok(`Airdrop confirmed.`);
    console.log();
    bold(`💰 Balance: ${c.gold}${(newBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL${c.reset}`);
  } catch (e) {
    err(`Airdrop failed: ${e.message}`);
    console.log();
    warn("This is usually a rate-limit. Options:");
    dim("  1. Wait 60 seconds and run again.");
    dim("  2. Use the web faucet: https://faucet.solana.com");
    dim(`     Paste your deployer address: ${deployer.publicKey.toBase58()}`);
    dim("  3. Use Solana CLI: solana airdrop 2 <address> --url devnet");
    process.exit(1);
  }

  console.log();
  bold(`Next step: ${c.gold}npm run 3:create${c.reset} ${c.dim}— create the SPL token mint${c.reset}`);
})();
