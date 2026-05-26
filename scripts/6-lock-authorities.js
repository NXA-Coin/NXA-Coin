/**
 * STEP 6 — Permanently revoke mint & freeze authority.  ⚠️  IRREVERSIBLE
 *
 * RUN ORDER: This MUST come AFTER step 5 (metadata).
 * Once authorities are revoked, you can't attach metadata anymore.
 *
 * After this script runs:
 *   • Mint authority is set to NULL — NO ONE can ever mint more NXA.
 *     Supply is locked at exactly 1,000,000,000 forever.
 *
 *   • Freeze authority is set to NULL — NO ONE can freeze a holder's account.
 *     NXA becomes a truly permissionless token.
 *
 * This is what serious tokens do (vs scam tokens that keep mint authority).
 * Investors and traders verify this on-chain before buying.
 *
 * Prompts for "LOCK" confirmation before executing.
 */
const {
  setAuthority,
  AuthorityType,
  getMint,
} = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const {
  banner, ok, info, warn, err, dim, bold, c,
  getConnection, loadDeployer, loadConfig, updateState, prompt,
  explorerUrl,
} = require("./_shared");

(async () => {
  banner("STEP 6 — LOCK AUTHORITIES (IRREVERSIBLE)");

  const cfg = loadConfig();
  if (!cfg.state.mintAddress) {
    err("No mint address in config. Run step 3 first.");
    process.exit(1);
  }
  if (!cfg.state.supplyMinted) {
    err("Supply not minted yet. Run step 4 first.");
    process.exit(1);
  }
  if (!cfg.state.metadataAdded) {
    err("Metadata not added yet. Run step 5 (npm run 5:metadata) FIRST.");
    err("Locking authorities before metadata = token forever shows as 'Unknown Token' in wallets.");
    process.exit(1);
  }

  const conn = getConnection();
  const deployer = loadDeployer();
  const mint = new PublicKey(cfg.state.mintAddress);

  // Show current state
  const before = await getMint(conn, mint);
  info(`Mint: ${mint.toBase58()}`);
  console.log();
  bold("Current authorities:");
  console.log(`  Mint authority:   ${before.mintAuthority ? before.mintAuthority.toBase58() : c.red + "(already revoked)" + c.reset}`);
  console.log(`  Freeze authority: ${before.freezeAuthority ? before.freezeAuthority.toBase58() : c.red + "(already revoked)" + c.reset}`);
  console.log();

  if (!before.mintAuthority && !before.freezeAuthority) {
    ok("Both authorities are already revoked. Nothing to do.");
    updateState({ mintAuthorityRevoked: true, freezeAuthorityRevoked: true });
    process.exit(0);
  }

  // Big scary warning + confirmation
  console.log(`${c.red}${c.bold}┌────────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.red}${c.bold}│  ⚠️   THIS IS IRREVERSIBLE                                  │${c.reset}`);
  console.log(`${c.red}${c.bold}│                                                            │${c.reset}`);
  console.log(`${c.red}${c.bold}│  After this, you CANNOT:                                   │${c.reset}`);
  console.log(`${c.red}${c.bold}│    • Mint more NXA-Coin (ever)                             │${c.reset}`);
  console.log(`${c.red}${c.bold}│    • Freeze any holder's tokens                            │${c.reset}`);
  console.log(`${c.red}${c.bold}│                                                            │${c.reset}`);
  console.log(`${c.red}${c.bold}│  Supply becomes permanently fixed at 1,000,000,000 NXA.    │${c.reset}`);
  console.log(`${c.red}${c.bold}└────────────────────────────────────────────────────────────┘${c.reset}`);
  console.log();
  const answer = await prompt('Type exactly "LOCK" to confirm — anything else aborts:');
  if (answer !== "LOCK") {
    info("Aborted. Authorities NOT revoked. Run again when ready.");
    process.exit(0);
  }
  console.log();

  // Revoke mint authority
  if (before.mintAuthority) {
    info("Revoking mint authority...");
    const sig = await setAuthority(
      conn,
      deployer,                         // fee payer
      mint,
      deployer.publicKey,               // current authority
      AuthorityType.MintTokens,
      null,                             // new authority = null (permanent revoke)
    );
    dim(`  TX: ${sig}`);
    ok("Mint authority revoked.");
    updateState({ mintAuthorityRevoked: true });
  }

  // Revoke freeze authority
  if (before.freezeAuthority) {
    info("Revoking freeze authority...");
    const sig = await setAuthority(
      conn,
      deployer,
      mint,
      deployer.publicKey,
      AuthorityType.FreezeAccount,
      null,
    );
    dim(`  TX: ${sig}`);
    ok("Freeze authority revoked.");
    updateState({ freezeAuthorityRevoked: true });
  }

  // Verify on-chain
  const after = await getMint(conn, mint);
  console.log();
  bold("On-chain state AFTER:");
  console.log(`  Mint authority:   ${after.mintAuthority ? c.red + "STILL SET (ERROR)" + c.reset : c.green + "✅ revoked (null)" + c.reset}`);
  console.log(`  Freeze authority: ${after.freezeAuthority ? c.red + "STILL SET (ERROR)" + c.reset : c.green + "✅ revoked (null)" + c.reset}`);
  console.log();
  bold(`🔒 NXA-Coin supply is now PERMANENTLY locked at 1,000,000,000.`);
  console.log();
  bold(`Final step: ${c.gold}npm run verify${c.reset} ${c.dim}— full on-chain summary + Explorer links${c.reset}`);
})();
