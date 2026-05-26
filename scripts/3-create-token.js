/**
 * STEP 3 — Create the NXA-Coin SPL token mint.
 *
 * This creates a NEW token on Solana with:
 *   • 9 decimals (standard for Solana tokens)
 *   • Deployer = mint authority (temporary — revoked in step 5)
 *   • Deployer = freeze authority (temporary — revoked in step 5)
 *
 * The mint address is the unique identifier of NXA-Coin on Solana.
 * It's saved to config.json for subsequent scripts.
 */
const { createMint } = require("@solana/spl-token");
const {
  banner, ok, info, warn, dim, bold, c,
  getConnection, loadDeployer, loadConfig, updateState,
  explorerUrl,
} = require("./_shared");

(async () => {
  banner("STEP 3 — CREATE SPL TOKEN MINT");

  const cfg = loadConfig();

  if (cfg.state.mintAddress) {
    warn(`Mint address already exists in config: ${cfg.state.mintAddress}`);
    warn(`Skipping creation to avoid duplicate. Delete from config.json to recreate.`);
    bold(`  Explorer: ${c.gold}${explorerUrl(cfg.state.mintAddress)}${c.reset}`);
    process.exit(0);
  }

  const conn = getConnection();
  const deployer = loadDeployer();

  info(`Deployer:      ${deployer.publicKey.toBase58()}`);
  info(`Token name:    ${cfg.token.name}`);
  info(`Token symbol:  ${cfg.token.symbol}`);
  info(`Decimals:      ${cfg.token.decimals}`);
  console.log();

  info("Creating mint account on Solana...");

  const mint = await createMint(
    conn,
    deployer,                  // fee payer
    deployer.publicKey,        // mint authority (temporary)
    deployer.publicKey,        // freeze authority (temporary)
    cfg.token.decimals
  );

  ok(`NXA-Coin mint created!`);
  console.log();
  bold("🪙  TOKEN MINT DETAILS:");
  console.log(`  ${c.dim}Mint address (this IS NXA-Coin's on-chain ID):${c.reset}`);
  console.log(`    ${c.gold}${c.bold}${mint.toBase58()}${c.reset}`);
  console.log();
  console.log(`  ${c.dim}Explorer:${c.reset}`);
  console.log(`    ${explorerUrl(mint.toBase58())}`);

  updateState({ mintAddress: mint.toBase58() });

  console.log();
  bold(`Next step: ${c.gold}npm run 4:mint${c.reset} ${c.dim}— mint 1B NXA supply${c.reset}`);
})();
