/**
 * @tropico/sdk — Typed error hierarchy
 */

export class TropicoError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "TropicoError";
    this.code = code;
    // Restore prototype chain in environments that mangle class hierarchies
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BsXError extends TropicoError {
  constructor(message: string, code = "BSX_ERROR") {
    super(message, code);
    this.name = "BsXError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PagoMovilError extends TropicoError {
  readonly fields: string[];

  constructor(message: string, fields: string[] = [], code = "PAGO_MOVIL_ERROR") {
    super(message, code);
    this.name = "PagoMovilError";
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidSolanaPayUrlError extends TropicoError {
  constructor(message: string) {
    super(message, "INVALID_SOLANA_PAY_URL");
    this.name = "InvalidSolanaPayUrlError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InsufficientReservesError extends TropicoError {
  readonly requiredUsdc: number;
  readonly availableUsdc: number;

  constructor(requiredUsdc: number, availableUsdc: number) {
    super(
      `Insufficient reserves: required ${requiredUsdc} USDC, available ${availableUsdc} USDC`,
      "INSUFFICIENT_RESERVES"
    );
    this.name = "InsufficientReservesError";
    this.requiredUsdc = requiredUsdc;
    this.availableUsdc = availableUsdc;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProtocolPausedError extends TropicoError {
  constructor(message = "The Tropico BsX protocol is currently paused") {
    super(message, "PROTOCOL_PAUSED");
    this.name = "ProtocolPausedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
