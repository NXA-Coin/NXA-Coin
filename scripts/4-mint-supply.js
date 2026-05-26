/**
 * STEP 4 — Mint the full 1,000,000,000 NXA supply to the deployer.
 *
 * Two things happen here:
 *   1. Create an "Associated Token Account" (ATA) for the deployer.
 *      This is the wallet sub-account that actually holds the NXA tokens.
 *      Every Solana wallet needs an ATA for each token it holds.
 *
 *   2. Mint exactly 1,000,000,000 NXA into that ATA.
 *      Internally Solana stores this as: 1B × 10^9 = 1e18 raw units.
 *
 * After this step, the deployer wallet holds 100% of the NXA supply.
 * Distribution (pool, founder, investors, etc.) happens later by transferring.
 */
const {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
  getAccount,
} = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const {
  banner, ok, info, warn, dim, bold, err, c,
  getConnection, loadDeployer, loadConfig, updateState,
  explorerUrl,
} = require("./_shared");

(async () => {
  banner("STEP 4 — MINT 1,000,000,000 NXA SUPPLY");

  const cfg = loadConfig();
  if (!cfg.state.mintAddress) {
    err("No mint address in config. Run step 3 first.");
    process.exit(1);
  }
  if (cfg.state.supplyMinted) {
    warn("Supply already minted. Skipping to avoid double-mint.");
    process.exit(0);
  }

  const conn = getConnection();
  const deployer = loadDeployer();
  const mintPubkey = new PublicKey(cfg.state.mintAddress);

  info(`Mint:     ${mintPubkey.toBase58()}`);
  info(`Receiver: ${deployer.publicKey.toBase58()} (deployer)`);
  console.log();

  // Step 4a — Get or create the deployer's NXA token account
  info("Step 4a — Creating Associated Token Account (ATA) for deployer...");
  const ata = await getOrCreateAssociatedTokenAccount(
    conn,
    deployer,                  // fee payer
    mintPubkey,
    deployer.publicKey,        // owner of the ATA
  );
  ok(`ATA ready: ${ata.address.toBase58()}`);

  // Step 4b — Mint the full supply
  console.log();
  const decimals = cfg.token.decimals;
  const totalSupplyRaw = BigInt(cfg.token.totalSupply) * BigInt(10 ** decimals);

  info(`Step 4b — Minting ${cfg.token.totalSupply.toLocaleString()} ${cfg.token.symbol}...`);
  dim(`  Raw units (with ${decimals} decimals): ${totalSupplyRaw.toString()}`);

  const sig = await mintTo(
    conn,
    deployer,                  // fee payer
    mintPubkey,
    ata.address,               // destination ATA
    deployer.publicKey,        // mint authority
    totalSupplyRaw,            // BigInt is supported
  );
  dim(`  TX signature: ${sig}`);

  // Step 4c — Verify
  const mintInfo = await getMint(conn, mintPubkey);
  const ataInfo = await getAccount(conn, ata.address);

  const onChainSupply = Number(mintInfo.supply) / 10 ** decimals;
  const onChainBalance = Number(ataInfo.amount) / 10 ** decimals;

  console.log();
  ok(`Mint successful!`);
  console.log();
  bold("💎  SUPPLY STATUS:");
  console.log(`  Total supply on-chain: ${c.gold}${c.bold}${onChainSupply.toLocaleString()} NXA${c.reset}`);
  console.log(`  Deployer balance:      ${c.gold}${c.bold}${onChainBalance.toLocaleString()} NXA${c.reset}`);
  console.log();
  console.log(`  ${c.dim}ATA Explorer: ${explorerUrl(ata.address.toBase58())}${c.reset}`);

  updateState({
    associatedTokenAccount: ata.address.toBase58(),
    supplyMinted: true,
  });

  console.log();
  bold(`Next step: ${c.gold}npm run 5:metadata${c.reset} ${c.dim}— attach name/symbol via Metaplex (must run BEFORE lock)${c.reset}`);
})();
