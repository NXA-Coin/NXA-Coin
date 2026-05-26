/**
 * STEP 5 — Attach Metaplex Token Metadata to NXA-Coin.
 *
 * IMPORTANT: This MUST run BEFORE step 6 (lock authorities).
 * Metaplex's createV1 instruction requires the deployer to still hold
 * mint authority. If you've already revoked it, metadata cannot be added.
 *
 * Without this, NXA appears in wallets as just "Unknown Token" with no name.
 * Metaplex Token Metadata Program v3 stores:
 *   • Token name ("NXA-Coin")
 *   • Token symbol ("NXA")
 *   • URI pointing to an off-chain JSON with logo + description
 *
 * The off-chain JSON (metadata/nxa-token.json) is the file we host
 * on a public URL later. For now we point to a placeholder URI.
 *
 * NOTE: This uses Metaplex UMI framework (the modern SDK).
 */
const fs = require("fs");
const path = require("path");
const { PublicKey } = require("@solana/web3.js");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const {
  createV1,
  TokenStandard,
  mplTokenMetadata,
} = require("@metaplex-foundation/mpl-token-metadata");
const {
  keypairIdentity,
  publicKey: umiPublicKey,
  percentAmount,
} = require("@metaplex-foundation/umi");
const {
  banner, ok, info, warn, err, dim, bold, c,
  loadDeployer, loadConfig, updateState,
  explorerUrl, ROOT,
} = require("./_shared");

(async () => {
  banner("STEP 5 — ATTACH METAPLEX METADATA");

  const cfg = loadConfig();
  if (!cfg.state.mintAddress) {
    err("No mint address in config. Run step 3 first.");
    process.exit(1);
  }
  if (cfg.state.metadataAdded) {
    warn("Metadata already added. Skipping.");
    process.exit(0);
  }

  // ── Off-chain metadata JSON (preserve existing — only write template if missing) ──
  const metadataDir = path.join(ROOT, "metadata");
  if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });

  const offChainPath = path.join(metadataDir, "nxa-token.json");
  if (fs.existsSync(offChainPath)) {
    ok(`Off-chain metadata already present: ${offChainPath}`);
    dim("  (Not overwriting — file is the source of truth and is hosted at metadataUri.)");
  } else {
    const offChainMetadata = {
      name: cfg.token.name,
      symbol: cfg.token.symbol,
      description: cfg.token.description,
      image: "https://raw.githubusercontent.com/NXA-Coin/nxa-coin/main/branding/nxa-logo.png",
      external_url: "https://x.com/NxvanaAI",
      attributes: [
        { trait_type: "Network",     value: "Solana" },
        { trait_type: "Type",        value: "Utility Token" },
        { trait_type: "Ecosystem",   value: "Nxvana AI" },
        { trait_type: "Total Supply", value: "1,000,000,000" },
        { trait_type: "Supply Locked", value: "Yes (mint authority revoked)" },
      ],
      properties: {
        category: "fungible",
        creators: [
          { address: cfg.state.deployerPublicKey, share: 100 }
        ]
      }
    };
    fs.writeFileSync(offChainPath, JSON.stringify(offChainMetadata, null, 2));
    ok(`Off-chain metadata template written to: ${offChainPath}`);
    warn("  (Template only — re-host on GitHub raw and re-verify metadataUri before re-running.)");
  }
  console.log();

  // ── Configure UMI ──
  const deployer = loadDeployer();
  const umi = createUmi(cfg.rpcUrl).use(mplTokenMetadata());

  // Convert web3.js Keypair → UMI keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(deployer.secretKey);
  umi.use(keypairIdentity(umiKeypair));

  info(`Deployer: ${deployer.publicKey.toBase58()}`);
  info(`Mint:     ${cfg.state.mintAddress}`);
  info(`URI:      ${cfg.token.metadataUri}`);
  console.log();

  info("Creating Metaplex metadata account...");
  try {
    const mint = umiPublicKey(cfg.state.mintAddress);
    await createV1(umi, {
      mint,
      authority: umi.identity,
      name: cfg.token.name,
      symbol: cfg.token.symbol,
      uri: cfg.token.metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);

    ok("Metadata account created on-chain.");
    updateState({ metadataAdded: true });

    console.log();
    bold("🏷️  METADATA SUMMARY:");
    console.log(`  Name:    ${c.gold}${cfg.token.name}${c.reset}`);
    console.log(`  Symbol:  ${c.gold}${cfg.token.symbol}${c.reset}`);
    console.log(`  URI:     ${cfg.token.metadataUri}`);
    console.log();
    console.log(`  ${c.dim}Mint Explorer: ${explorerUrl(cfg.state.mintAddress)}${c.reset}`);
  } catch (e) {
    err(`Metadata creation failed: ${e.message}`);
    if (e.logs) {
      dim("Transaction logs:");
      e.logs.forEach(log => dim(`  ${log}`));
    }
    process.exit(1);
  }

  console.log();
  bold(`🎉  ${c.gold}NXA-Coin deployment complete!${c.reset}`);
  bold(`Next step: ${c.gold}npm run 6:lock${c.reset} ${c.dim}— permanently revoke mint & freeze authority (irreversible)${c.reset}`);
})();
