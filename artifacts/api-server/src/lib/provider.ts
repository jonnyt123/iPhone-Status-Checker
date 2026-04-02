import { logger } from "./logger";
import { encrypt } from "./crypto";

export interface NormalizedResult {
  providerName: string;
  checkedAt: Date;
  identifierType: string;
  identifierMasked: string;
  brand: string | null;
  model: string | null;
  manufacturer: string | null;
  imei: string | null;
  serial: string | null;
  blacklistStatus: "clear" | "blacklisted" | "unavailable" | "error";
  activationLockStatus: "on" | "off" | "unavailable" | "error";
  findMyStatus: "on" | "off" | "unavailable" | "error";
  providerCoverageNotes: string | null;
  rawProviderResponseEncrypted: string;
}

function mapBlacklistStatus(
  value: unknown
): "clear" | "blacklisted" | "unavailable" | "error" {
  if (value == null) return "unavailable";
  const v = String(value).toLowerCase();
  if (v === "clean" || v === "clear" || v === "not blacklisted" || v === "0") return "clear";
  if (v === "blacklisted" || v === "blocked" || v === "lost" || v === "stolen" || v === "1") return "blacklisted";
  if (v === "error" || v === "failed") return "error";
  return "unavailable";
}

function mapOnOffStatus(value: unknown): "on" | "off" | "unavailable" | "error" {
  if (value == null) return "unavailable";
  const v = String(value).toLowerCase();
  if (v === "on" || v === "enabled" || v === "true" || v === "1" || v === "yes") return "on";
  if (v === "off" || v === "disabled" || v === "false" || v === "0" || v === "no") return "off";
  if (v === "error" || v === "failed") return "error";
  return "unavailable";
}

function nullIfEmpty(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" || s.toLowerCase() === "n/a" || s.toLowerCase() === "null" ? null : s;
}

async function callImeiApi(
  identifier: string,
  identifierType: string
): Promise<Record<string, unknown>> {
  const baseUrl = process.env.IMEIAPI_BASE_URL;
  const apiKey = process.env.IMEIAPI_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("IMEIAPI provider not configured");
  }

  const url = new URL(`${baseUrl}/check`);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      identifier,
      type: identifierType,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Provider returned ${response.status}: ${text}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

async function callWithRetry(
  identifier: string,
  identifierType: string,
  maxAttempts = 2
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await callImeiApi(identifier, identifierType);
    } catch (err) {
      lastError = err as Error;
      logger.warn({ err, attempt }, "Provider call failed, retrying");
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

export async function runProviderCheck(
  identifier: string,
  identifierType: string,
  identifierMasked: string
): Promise<NormalizedResult> {
  const useMock = process.env.MOCK_PROVIDER === "true" || !process.env.IMEIAPI_BASE_URL;

  if (useMock) {
    logger.info({ identifierType }, "Using mock provider");
    const mockRaw = {
      mock: true,
      brand: "Apple",
      model: "iPhone 13",
      manufacturer: "Apple Inc.",
      blacklisted: "clean",
      activationLock: null,
      findMyEnabled: null,
      note: "Mock provider — no real data returned",
    };
    return {
      providerName: "Mock Provider",
      checkedAt: new Date(),
      identifierType,
      identifierMasked,
      brand: "Apple",
      model: "iPhone 13",
      manufacturer: "Apple Inc.",
      imei: identifierType === "imei" ? identifierMasked : null,
      serial: identifierType === "serial" ? identifierMasked : null,
      blacklistStatus: "unavailable",
      activationLockStatus: "unavailable",
      findMyStatus: "unavailable",
      providerCoverageNotes:
        "This is a mock result for testing. No real provider data was queried.",
      rawProviderResponseEncrypted: encrypt(JSON.stringify(mockRaw)),
    };
  }

  const providerName = process.env.PROVIDER_NAME ?? "IMEI API";
  const raw = await callWithRetry(identifier, identifierType);

  const encrypted = encrypt(JSON.stringify(raw));

  return {
    providerName,
    checkedAt: new Date(),
    identifierType,
    identifierMasked,
    brand: nullIfEmpty(raw["brand"] ?? raw["Brand"] ?? raw["make"]),
    model: nullIfEmpty(raw["model"] ?? raw["Model"] ?? raw["modelName"]),
    manufacturer: nullIfEmpty(raw["manufacturer"] ?? raw["Manufacturer"]),
    imei: identifierType === "imei" ? nullIfEmpty(raw["imei"] ?? raw["IMEI"]) : null,
    serial: identifierType === "serial" ? nullIfEmpty(raw["serial"] ?? raw["Serial"]) : null,
    blacklistStatus: mapBlacklistStatus(
      raw["blacklisted"] ?? raw["blacklist"] ?? raw["status"] ?? raw["gsmaStatus"]
    ),
    activationLockStatus: mapOnOffStatus(
      raw["activationLock"] ?? raw["activation_lock"] ?? raw["icloudLock"]
    ),
    findMyStatus: mapOnOffStatus(
      raw["findMy"] ?? raw["find_my"] ?? raw["findMyEnabled"] ?? raw["find_my_iphone"]
    ),
    providerCoverageNotes: nullIfEmpty(raw["note"] ?? raw["notes"] ?? raw["message"]),
    rawProviderResponseEncrypted: encrypted,
  };
}
