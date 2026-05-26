/**
 * Shared helpers for all NXA-Coin deployment scripts.
 */
const fs = require("fs");
const path = require("path");
const { Connection, Keypair, clusterApiUrl } = require("@solana/web3.js");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config.json");
const KEYS_DIR = path.join(ROOT, "keys");

// ── Pretty logging ──
const c = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  gold:    "\x1b[33m",
  green:   "\x1b[32m",
  red:     "\x1b[31m",
  cyan:    "\x1b[36m",
  magenta: "\x1b[35m",
};

function banner(title) {
  const line = "═".repeat(60);
  console.log(`\n${c.gold}${line}${c.reset}`);
  console.log(`${c.gold}  ${c.bold}${title}${c.reset}`);
  console.log(`${c.gold}${line}${c.reset}\n`);
}

function ok(msg)   { console.log(`${c.green}✅ ${msg}${c.reset}`); }
function info(msg) { console.log(`${c.cyan}ℹ️  ${msg}${c.reset}`); }
function warn(msg) { console.log(`${c.gold}⚠️  ${msg}${c.reset}`); }
function err(msg)  { console.log(`${c.red}❌ ${msg}${c.reset}`); }
function dim(msg)  { console.log(`${c.dim}${msg}${c.reset}`); }
function bold(msg) { console.log(`${c.bold}${msg}${c.reset}`); }

// ── Config I/O ──
function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

function updateState(updates) {
  const cfg = loadConfig();
  cfg.state = { ...cfg.state, ...updates };
  saveConfig(cfg);
  return cfg;
}

// ── Keypair I/O ──
function ensureKeysDir() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }
}

function loadDeployer() {
  const cfg = loadConfig();
  const keypairPath = path.resolve(ROOT, cfg.deployerKeypairPath);
  if (!fs.existsSync(keypairPath)) {
    err(`Deployer keypair not found at: ${keypairPath}`);
    err(`Run: npm run 1:keypair first.`);
    process.exit(1);
  }
  const secret = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function saveKeypair(keypair, filename = "deployer.json") {
  ensureKeysDir();
  const target = path.join(KEYS_DIR, filename);
  fs.writeFileSync(target, JSON.stringify(Array.from(keypair.secretKey)));
  return target;
}

// ── Connection ──
function getConnection() {
  const cfg = loadConfig();
  return new Connection(cfg.rpcUrl, "confirmed");
}

// ── Explorer ──
function explorerUrl(address, type = "address") {
  const cfg = loadConfig();
  const cluster = cfg.network === "mainnet-beta" ? "" : `?cluster=${cfg.network}`;
  return `https://explorer.solana.com/${type}/${address}${cluster}`;
}

// ── Prompt for confirmation ──
function prompt(question) {
  return new Promise(resolve => {
    process.stdout.write(`${c.gold}${question}${c.reset} `);
    process.stdin.resume();
    process.stdin.once("data", data => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

module.exports = {
  c, banner, ok, info, warn, err, dim, bold,
  loadConfig, saveConfig, updateState,
  loadDeployer, saveKeypair, ensureKeysDir,
  getConnection, explorerUrl, prompt,
  ROOT, CONFIG_PATH, KEYS_DIR,
};
