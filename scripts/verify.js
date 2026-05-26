/**
 * VERIFY — Final on-chain audit of NXA-Coin.
 *
 * Prints everything an investor (or Keith's lawyer) would want to verify:
 *   • Mint address + supply
 *   • Decimals
 *   • Mint authority status (should be null)
 *   • Freeze authority status (should be null)
 *   • Deployer balance
 *   • Metaplex metadata (name, symbol, URI)
 *   • Solana Explorer links for everything
 */
const { PublicKey } = require("@solana/web3.js");
const { getMint, getAccount } = require("@solana/spl-token");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const {
  fetchMetadataFromSeeds,
  mplTokenMetadata,
} = require("@metaplex-foundation/mpl-token-metadata");
const { publicKey: umiPublicKey } = require("@metaplex-foundation/umi");
const {
  banner, ok, warn, err, dim, bold, info, c,
  getConnection, loadConfig, explorerUrl,
} = require("./_shared");

(async () => {
  banner("NXA-COIN — FINAL VERIFICATION");

  const cfg = loadConfig();
  if (!cfg.state.mintAddress) {
    err("No mint address in config — nothing to verify.");
    process.exit(1);
  }

  const conn = getConnection();
  const mintPubkey = new PublicKey(cfg.state.mintAddress);

  // ── Mint info ──
  const mintInfo = await getMint(conn, mintPubkey);
  const decimals = mintInfo.decimals;
  const supply = Number(mintInfo.supply) / 10 ** decimals;

  bold("🪙  TOKEN MINT");
  console.log(`  Name:           ${c.gold}${cfg.token.name}${c.reset}`);
  console.log(`  Symbol:         ${c.gold}${cfg.token.symbol}${c.reset}`);
  console.log(`  Mint address:   ${c.gold}${cfg.state.mintAddress}${c.reset}`);
  console.log(`  Decimals:       ${decimals}`);
  console.log(`  Total supply:   ${c.gold}${supply.toLocaleString()} NXA${c.reset}`);
  console.log(`  Network:        ${cfg.network}`);
  console.log();

  // ── Authorities ──
  bold("🔒  AUTHORITIES");
  const mintAuth = mintInfo.mintAuthority ? mintInfo.mintAuthority.toBase58() : null;
  const freezeAuth = mintInfo.freezeAuthority ? mintInfo.freezeAuthority.toBase58() : null;
  console.log(`  Mint authority:   ${mintAuth ? c.red + mintAuth + " (NOT REVOKED)" + c.reset : c.green + "null (✅ revoked — supply is fixed)" + c.reset}`);
  console.log(`  Freeze authority: ${freezeAuth ? c.red + freezeAuth + " (NOT REVOKED)" + c.reset : c.green + "null (✅ revoked — fully permissionless)" + c.reset}`);
  console.log();

  // ── Deployer holdings ──
  if (cfg.state.associatedTokenAccount) {
    bold("💰  DEPLOYER HOLDINGS");
    try {
      const ataInfo = await getAccount(conn, new PublicKey(cfg.state.associatedTokenAccount));
      const balance = Number(ataInfo.amount) / 10 ** decimals;
      console.log(`  Wallet:    ${cfg.state.deployerPublicKey}`);
      console.log(`  ATA:       ${cfg.state.associatedTokenAccount}`);
      console.log(`  Balance:   ${c.gold}${balance.toLocaleString()} NXA${c.reset} (${((balance / supply) * 100).toFixed(2)}% of total supply)`);
    } catch (e) {
      warn(`Could not fetch ATA balance: ${e.message}`);
    }
    console.log();
  }

  // ── Metaplex metadata ──
  bold("🏷️   METAPLEX METADATA");
  try {
    const umi = createUmi(cfg.rpcUrl).use(mplTokenMetadata());
    const metadata = await fetchMetadataFromSeeds(umi, { mint: umiPublicKey(cfg.state.mintAddress) });
    console.log(`  On-chain name:    ${c.green}${metadata.name.trim()}${c.reset}`);
    console.log(`  On-chain symbol:  ${c.green}${metadata.symbol.trim()}${c.reset}`);
    console.log(`  On-chain URI:     ${metadata.uri.trim()}`);
  } catch (e) {
    warn(`No Metaplex metadata found (run step 6).`);
  }
  console.log();

  // ── Explorer links ──
  bold("🔗  EXPLORER LINKS");
  console.log(`  Mint:     ${explorerUrl(cfg.state.mintAddress)}`);
  if (cfg.state.deployerPublicKey) {
    console.log(`  Wallet:   ${explorerUrl(cfg.state.deployerPublicKey)}`);
  }
  if (cfg.state.associatedTokenAccount) {
    console.log(`  ATA:      ${explorerUrl(cfg.state.associatedTokenAccount)}`);
  }
  console.log();

  // ── Status summary ──
  const allDone = cfg.state.supplyMinted
    && cfg.state.mintAuthorityRevoked
    && cfg.state.freezeAuthorityRevoked
    && cfg.state.metadataAdded;

  if (allDone) {
    ok(`🎉  NXA-Coin deployment is COMPLETE.`);
    console.log();
    dim(`  ${cfg.network} deployment fully verified.`);
    if (cfg.network !== "mainnet-beta") {
      dim("  To go to mainnet: change network in config.json + fund deployer with real SOL.");
    }
  } else {
    warn("Deployment is INCOMPLETE. Outstanding steps:");
    if (!cfg.state.supplyMinted)            console.log(`  ${c.red}✗${c.reset} Supply minted        ${c.dim}(run: npm run 4:mint)${c.reset}`);
    if (!cfg.state.mintAuthorityRevoked)    console.log(`  ${c.red}✗${c.reset} Mint authority lock  ${c.dim}(run: npm run 6:lock)${c.reset}`);
    if (!cfg.state.freezeAuthorityRevoked)  console.log(`  ${c.red}✗${c.reset} Freeze authority lock ${c.dim}(run: npm run 6:lock)${c.reset}`);
    if (!cfg.state.metadataAdded)           console.log(`  ${c.red}✗${c.reset} Metaplex metadata    ${c.dim}(run: npm run 5:metadata)${c.reset}`);
  }
})();
