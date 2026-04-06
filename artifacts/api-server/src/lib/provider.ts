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

export interface ProviderMeta {
  providerCalled: boolean;
  providerHttpStatus: number | null;
  providerResponseReceived: boolean;
  providerErrorMessage: string | null;
}

export interface ProviderCheckResult {
  normalized: NormalizedResult;
  meta: ProviderMeta;
}

const IMEIAPI_URL = "https://www.imeiapi.org/checkimei/";

function mapBlacklistStatus(
  value: unknown
): "clear" | "blacklisted" | "unavailable" | "error" {
  if (value == null) return "unavailable";
  const v = String(value).toLowerCase().trim();
  if (v === "clean" || v === "clear" || v === "not blacklisted" || v === "0" || v === "no") return "clear";
  if (v === "blacklisted" || v === "blocked" || v === "lost" || v === "stolen" || v === "1" || v === "yes") return "blacklisted";
  if (v === "error" || v === "failed") return "error";
  return "unavailable";
}

function mapOnOffStatus(value: unknown): "on" | "off" | "unavailable" | "error" {
  if (value == null) return "unavailable";
  const v = String(value).toLowerCase().trim();
  if (v === "on" || v === "enabled" || v === "true" || v === "1" || v === "yes") return "on";
  if (v === "off" || v === "disabled" || v === "false" || v === "0" || v === "no") return "off";
  if (v === "error" || v === "failed") return "error";
  return "unavailable";
}

function nullIfEmpty(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" || s.toLowerCase() === "n/a" || s.toLowerCase() === "null" || s.toLowerCase() === "none" ? null : s;
}

function sanitizeForLog(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const obj = raw as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.toLowerCase();
    if (key === "key" || key === "apikey" || key === "api_key" || key === "token") {
      sanitized[k] = "[REDACTED]";
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

interface RawProviderResponse {
  data: Record<string, unknown>;
  httpStatus: number;
}

async function callImeiApiOrg(imei: string): Promise<RawProviderResponse> {
  const apiKey = process.env.IMEIAPI_KEY;

  if (!apiKey) {
    logger.error(
      "IMEIAPI_KEY is not set — cannot call provider. Set IMEIAPI_KEY in your environment secrets."
    );
    throw new Error("IMEIAPI_KEY is not configured. Provider check cannot proceed.");
  }

  const form = new FormData();
  form.append("key", apiKey);
  form.append("imei", imei);

  logger.info({ imeiSuffix: imei.slice(-4), url: IMEIAPI_URL }, "Provider: sending request to imeiapi.org");

  const response = await fetch(IMEIAPI_URL, {
    method: "POST",
    body: form,
  });

  const httpStatus = response.status;
  const responseText = await response.text();

  logger.info({ httpStatus, responseLength: responseText.length }, "Provider: received response");

  if (httpStatus === 401 || httpStatus === 403) {
    logger.error(
      { httpStatus },
      "Provider: authentication failed — IMEIAPI_KEY may be invalid, expired, or over quota. Check your key at imeiapi.org."
    );
    throw new Error(`Provider authentication failed (HTTP ${httpStatus}). IMEIAPI_KEY may be invalid, expired, or over quota.`);
  }

  if (httpStatus === 429) {
    logger.error({ httpStatus }, "Provider: rate limit exceeded or quota exhausted. Check your plan at imeiapi.org.");
    throw new Error(`Provider rate limit exceeded (HTTP ${httpStatus}).`);
  }

  if (!response.ok) {
    logger.error({ httpStatus, responseText }, "Provider: non-OK response");
    throw new Error(`Provider returned HTTP ${httpStatus}: ${responseText.slice(0, 200)}`);
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    logger.error({ httpStatus, responseText: responseText.slice(0, 500) }, "Provider: response is not valid JSON");
    throw new Error(`Provider returned non-JSON response (HTTP ${httpStatus})`);
  }

  logger.info({ sanitized: sanitizeForLog(data) }, "Provider: response body (sanitized)");

  const statusField = data["status"] ?? data["Status"] ?? data["success"];
  if (
    statusField != null &&
    (String(statusField).toLowerCase() === "error" ||
      String(statusField).toLowerCase() === "fail" ||
      String(statusField).toLowerCase() === "false" ||
      statusField === false)
  ) {
    const msg = nullIfEmpty(data["message"] ?? data["error"] ?? data["msg"]) ?? "Provider returned error status";
    logger.error({ msg, data: sanitizeForLog(data) }, "Provider: API-level error in response");

    if (
      String(msg).toLowerCase().includes("invalid key") ||
      String(msg).toLowerCase().includes("api key") ||
      String(msg).toLowerCase().includes("unauthorized") ||
      String(msg).toLowerCase().includes("expired") ||
      String(msg).toLowerCase().includes("quota") ||
      String(msg).toLowerCase().includes("limit")
    ) {
      logger.error("Provider: IMEIAPI_KEY appears invalid, expired, or over quota — check your key at imeiapi.org.");
    }

    throw new Error(`Provider API error: ${msg}`);
  }

  return { data, httpStatus };
}

function normalizeImeiApiResponse(
  raw: Record<string, unknown>,
  imei: string,
  identifierType: string,
  identifierMasked: string
): NormalizedResult {
  const providerName = process.env.PROVIDER_NAME ?? "IMEI API (imeiapi.org)";
  const encrypted = encrypt(JSON.stringify(raw));

  return {
    providerName,
    checkedAt: new Date(),
    identifierType,
    identifierMasked,
    brand: nullIfEmpty(
      raw["brand"] ?? raw["Brand"] ?? raw["make"] ?? raw["Make"] ?? raw["brandName"]
    ),
    model: nullIfEmpty(
      raw["model"] ?? raw["Model"] ?? raw["modelName"] ?? raw["model_name"] ?? raw["deviceModel"]
    ),
    manufacturer: nullIfEmpty(
      raw["manufacturer"] ?? raw["Manufacturer"] ?? raw["mfr"]
    ),
    imei: identifierType === "imei" ? (nullIfEmpty(raw["imei"] ?? raw["IMEI"]) ?? imei) : null,
    serial: identifierType === "serial" ? nullIfEmpty(raw["serial"] ?? raw["Serial"]) : null,
    blacklistStatus: mapBlacklistStatus(
      raw["blacklisted"] ??
        raw["blacklist"] ??
        raw["blacklist_status"] ??
        raw["blacklistStatus"] ??
        raw["gsmaStatus"] ??
        raw["gsma_status"] ??
        raw["esn_status"]
    ),
    activationLockStatus: mapOnOffStatus(
      raw["activationLock"] ??
        raw["activation_lock"] ??
        raw["icloudLock"] ??
        raw["icloud_lock"] ??
        raw["findMyEnabled"] ??
        raw["activation_lock_status"]
    ),
    findMyStatus: mapOnOffStatus(
      raw["findMy"] ??
        raw["find_my"] ??
        raw["find_my_iphone"] ??
        raw["findMyIphone"] ??
        raw["find_my_status"]
    ),
    providerCoverageNotes: nullIfEmpty(
      raw["note"] ?? raw["notes"] ?? raw["message"] ?? raw["coverage"] ?? raw["msg"]
    ),
    rawProviderResponseEncrypted: encrypted,
  };
}

export async function runProviderCheck(
  identifier: string,
  identifierType: string,
  identifierMasked: string
): Promise<ProviderCheckResult> {
  const useMock = process.env.MOCK_PROVIDER === "true" || !process.env.IMEIAPI_KEY;

  if (useMock) {
    if (!process.env.IMEIAPI_KEY) {
      logger.warn(
        "MOCK_PROVIDER mode active because IMEIAPI_KEY is not set. Set IMEIAPI_KEY to enable real provider calls."
      );
    } else {
      logger.info({ identifierType }, "MOCK_PROVIDER=true — using mock provider");
    }

    const mockRaw = {
      mock: true,
      brand: "Apple",
      model: "iPhone 13",
      manufacturer: "Apple Inc.",
      blacklisted: "clean",
      activationLock: null,
      findMy: null,
      note: "Mock provider — no real data returned. Set MOCK_PROVIDER=false and provide a valid IMEIAPI_KEY for real checks.",
    };

    return {
      normalized: {
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
      },
      meta: {
        providerCalled: false,
        providerHttpStatus: null,
        providerResponseReceived: false,
        providerErrorMessage: null,
      },
    };
  }

  logger.info(
    { identifierType, imeiSuffix: identifier.slice(-4) },
    "Provider check started — calling imeiapi.org"
  );

  try {
    const { data, httpStatus } = await callImeiApiOrg(identifier);
    const normalized = normalizeImeiApiResponse(data, identifier, identifierType, identifierMasked);

    logger.info(
      {
        httpStatus,
        blacklistStatus: normalized.blacklistStatus,
        activationLockStatus: normalized.activationLockStatus,
        findMyStatus: normalized.findMyStatus,
      },
      "Provider check complete"
    );

    return {
      normalized,
      meta: {
        providerCalled: true,
        providerHttpStatus: httpStatus,
        providerResponseReceived: true,
        providerErrorMessage: null,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err, msg }, "Provider check FAILED");
    throw err;
  }
}
