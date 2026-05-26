/**
 * STEP 1 — Generate the deployer keypair.
 *
 * This wallet will:
 *   • Pay all transaction fees during deployment
 *   • Become the temporary mint authority + freeze authority
 *   • Receive the initial 1B NXA supply
 *   • Hold the founder allocation, investor allocation, treasury, etc.
 *
 * The keypair is saved to keys/deployer.json — KEEP THIS FILE SAFE.
 * Anyone with this file has full control over the NXA-Coin supply.
 */
const fs = require("fs");
const path = require("path");
const bs58 = require("bs58").default;
const { Keypair } = require("@solana/web3.js");
const {
  banner, ok, info, warn, dim, bold,
  saveKeypair, updateState, loadConfig,
  KEYS_DIR, ROOT, prompt, c,
} = require("./_shared");

(async () => {
  banner("STEP 1 — GENERATE DEPLOYER KEYPAIR");

  const cfg = loadConfig();
  const keypairPath = path.resolve(ROOT, cfg.deployerKeypairPath);

  if (fs.existsSync(keypairPath)) {
    warn(`Keypair already exists at: ${keypairPath}`);
    const answer = await prompt("Overwrite? Type 'YES' to confirm:");
    if (answer !== "YES") {
      info("Aborted. Existing keypair preserved.");
      const existing = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
      const kp = Keypair.fromSecretKey(Uint8Array.from(existing));
      console.log();
      bold("Existing Deployer Wallet:");
      console.log(`  Public Key: ${c.gold}${kp.publicKey.toBase58()}${c.reset}`);
      process.exit(0);
    }
  }

  // Generate fresh keypair
  const deployer = Keypair.generate();
  const savedPath = saveKeypair(deployer, "deployer.json");

  ok(`Deployer keypair generated.`);
  console.log();
  bold("📋 DEPLOYER WALLET DETAILS:");
  console.log(`  ${c.dim}Public Key (share freely):${c.reset}`);
  console.log(`    ${c.gold}${c.bold}${deployer.publicKey.toBase58()}${c.reset}`);
  console.log();
  console.log(`  ${c.dim}Keypair file (KEEP SECRET):${c.reset}`);
  console.log(`    ${savedPath}`);
  console.log();
  console.log(`  ${c.dim}Secret key (base58 — for Phantom import):${c.reset}`);
  console.log(`    ${c.dim}${bs58.encode(deployer.secretKey)}${c.reset}`);

  // Persist public key to config
  updateState({ deployerPublicKey: deployer.publicKey.toBase58() });

  console.log();
  warn("🔐 SECURITY NOTES:");
  dim("  • Anyone with the keypair file can drain all NXA from this wallet.");
  dim("  • The keys/ folder is gitignored — never commit it.");
  dim("  • For mainnet, consider importing into a hardware wallet (Ledger).");
  dim("  • Back this file up to encrypted offline storage before going live.");

  console.log();
  bold(`Next step: ${c.gold}npm run 2:airdrop${c.reset} ${c.dim}— request devnet SOL for fees${c.reset}`);
})();
