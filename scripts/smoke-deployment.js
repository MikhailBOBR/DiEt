const baseUrl = String(process.env.DEPLOY_BASE_URL || "").replace(/\/$/, "");
const expectedRelease = String(process.env.EXPECTED_RELEASE_VERSION || "").trim();
const attempts = Number(process.env.SMOKE_ATTEMPTS || 30);
const intervalMs = Number(process.env.SMOKE_INTERVAL_MS || 10000);

function delay(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function readJson(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }

  return response.json();
}

async function verifyDeployment() {
  const [live, ready, health, openapi] = await Promise.all([
    readJson("/api/live"),
    readJson("/api/ready"),
    readJson("/api/health"),
    readJson("/api/openapi.json")
  ]);

  if (live.alive !== true) {
    throw new Error("Liveness response does not confirm a live process");
  }

  if (ready.ready !== true) {
    throw new Error("Readiness response does not confirm a ready service");
  }

  if (expectedRelease && health.version !== expectedRelease) {
    throw new Error(`Expected release ${expectedRelease}, received ${health.version}`);
  }

  if (openapi.openapi !== "3.0.3") {
    throw new Error("OpenAPI document is unavailable or has an unexpected version");
  }

  return {
    environment: health.environment,
    release: health.version,
    service: health.service
  };
}

async function main() {
  if (!baseUrl) {
    throw new Error("DEPLOY_BASE_URL is required");
  }

  if (!Number.isInteger(attempts) || attempts < 1 || !Number.isFinite(intervalMs) || intervalMs < 0) {
    throw new Error("SMOKE_ATTEMPTS and SMOKE_INTERVAL_MS must be valid positive values");
  }

  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const summary = await verifyDeployment();
      console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
      return;
    } catch (error) {
      lastError = error;
      console.error(`Deployment smoke attempt ${attempt}/${attempts} failed: ${error.message}`);

      if (attempt < attempts) {
        await delay(intervalMs);
      }
    }
  }

  throw lastError;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Deployment smoke failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  verifyDeployment
};
