// One-time seed: pushes the existing 23 parts + 6 vehicles (and the parts'
// photos) into Netlify Blobs via the Netlify CLI, so the site has the same
// content it has today once it switches from hardcoded HTML to the API.
//
// Usage:
//   netlify dev:exec node scripts/seed.js          (local dev store)
//   netlify dev:exec --context production node scripts/seed.js   (real site,
//     after `netlify link` — see README notes)
const { execFileSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const manifest = require("./seed-images-manifest.json");

function run(args) {
  console.log("$ netlify " + args.join(" "));
  execFileSync("netlify", args, { stdio: "inherit", cwd: root });
}

console.log(`Uploading ${manifest.length} part photos to the "images" store...`);
for (const { sourceFile, blobKey } of manifest) {
  const input = path.join(root, "image", "ersatzteile", sourceFile);
  run(["blobs:set", "images", blobKey, "--input", input]);
}

console.log('Writing "ersatzteile" catalog (23 items)...');
run([
  "blobs:set",
  "ersatzteile",
  "items",
  "--input",
  path.join(root, "scripts", "seed-ersatzteile.json"),
]);

console.log('Writing "fahrzeuge" catalog (6 items)...');
run([
  "blobs:set",
  "fahrzeuge",
  "items",
  "--input",
  path.join(root, "scripts", "seed-fahrzeuge.json"),
]);

console.log("Seed complete.");
