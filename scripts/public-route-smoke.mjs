/**
 * No test accounts or production data are needed for this public-route smoke.
 * It validates the built Next.js server using placeholder Supabase credentials.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = "32717";
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["./node_modules/next/dist/bin/next", "start", "-p", port], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "verification-placeholder",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", chunk => { output += String(chunk).slice(-2500); });
server.stderr.on("data", chunk => { output += String(chunk).slice(-2500); });

async function request(path, options) {
  return fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(8000), ...options });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 55; attempt++) {
    if (server.exitCode !== null) throw new Error(`Next.js exited early: ${output}`);
    try {
      const response = await request("/about");
      if (response.status === 200) { ready = true; break; }
    } catch { /* Next.js server is still starting. */ }
    await sleep(500);
  }
  assert.ok(ready, `Next.js did not start: ${output}`);

  const about = await request("/about");
  assert.equal(about.status, 200, "public service explanation must be accessible");
  const html = await about.text();
  assert.match(html, /Prof\./, "brand name must be visible to visitors");
  assert.match(html, /Goal/, "public explanation must describe actual features");
  assert.match(html, /TEAM/, "public explanation must describe team features");
  console.log("PASS: public Prof. introduction");

  const invalid = await request("/api/locale", {
    method: "POST", headers: { "Content-Type": "application/json", "Origin": base },
    body: JSON.stringify({ locale: "fr" }),
  });
  assert.equal(invalid.status, 400, "unknown languages must be refused");
  const crossOrigin = await request("/api/locale", {
    method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://attacker.example" },
    body: JSON.stringify({ locale: "ko" }),
  });
  assert.equal(crossOrigin.status, 403, "cross-origin preference changes must be rejected");
  const locale = await request("/api/locale", {
    method: "POST", headers: { "Content-Type": "application/json", "Origin": base },
    body: JSON.stringify({ locale: "en" }),
  });
  assert.equal(locale.status, 200, "valid language switch must work");
  assert.match(locale.headers.get("set-cookie") ?? "", /en/, "chosen language must be persisted");
  const koreanPage = await request("/about", { headers: { "Accept-Language": "ko-KR,ko;q=0.9" } });
  assert.equal(koreanPage.status, 200);
  assert.match(await koreanPage.text(), /Prof\.에서 실제로 할 수 있는 일/, "Korean feature details should be visible");

  const savedCookie = (locale.headers.get("set-cookie") ?? "").split(";")[0];
  const englishPage = await request("/about", { headers: { Cookie: savedCookie, "Accept-Language": "ko-KR" } });
  assert.equal(englishPage.status, 200);
  assert.match(await englishPage.text(), /Six things you can actually do/, "English preference should override browser language");
  console.log("PASS: English and Korean product descriptions");

  console.log("PASS: language preference validation and origin check");

  const exportResponse = await request("/api/account/export");
  assert.equal(exportResponse.status, 401, "personal data export must require authentication");
  console.log("PASS: personal data export denies anonymous access");

  const privateResponse = await request("/settings/privacy");
  assert.ok([302, 303, 307, 308].includes(privateResponse.status), "private settings must redirect anonymous users");
  assert.match(privateResponse.headers.get("location") || "", /login/, "private settings redirect to login");
  console.log("PASS: protected settings deny anonymous access");
} catch (error) {
  console.error(error);
  console.error("Next.js logs:", output.slice(-3500));
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  await Promise.race([new Promise(resolve => server.once("exit", resolve)), sleep(2000)]);
}
