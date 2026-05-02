/**
 * Shared Govee app-impersonation constants.
 * The mqtt and undocumented-api clients both need to identify themselves
 * as the official Govee Home app to get valid responses.
 */

import { v5 as uuidv5, NIL as UUID_NIL } from "uuid";

export const GOVEE_APP_VERSION = "7.4.22";
export const GOVEE_CLIENT_TYPE = "1";
export const GOVEE_USER_AGENT = `GoveeHome/${GOVEE_APP_VERSION} (com.ihoment.GoVeeSensor; build:8; iOS 26.5.0) Alamofire/5.11.0`;

/** Base URL for the undocumented Govee app API (devices/v1/list, scene library, etc.). */
export const GOVEE_APP_BASE_URL = "https://app2.govee.com";

/**
 * Derive a stable, account-specific client ID from the user's email.
 *
 * The previous hardcoded constant looked like a single bot account from Govee's
 * side, which is the kind of thing that gets rate-limited or flagged.
 * Three reference implementations (homebridge-govee, govee2mqtt PR #652, PR #656)
 * all use UUIDv5(email) — same input always returns the same UUID, so each user
 * has one stable ID across restarts but each account is distinct.
 *
 * @param email - Govee account email address. Empty/undefined returns a deterministic
 *                fallback so existing call sites that build the ID before login
 *                don't crash; the fallback is never sent to Govee in practice.
 */
export function deriveGoveeClientId(email: string | undefined): string {
  const seed = (email ?? "").trim().toLowerCase() || "anonymous";
  return uuidv5(seed, UUID_NIL).replace(/-/g, "");
}
