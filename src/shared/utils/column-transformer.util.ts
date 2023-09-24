import { isJSON } from 'class-validator';
import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto-js';

export class DecimalColumnToNumberTransformer implements ValueTransformer {
  to(value: string): string {
    return value;
  }

  from(value: string): number {
    return value ? parseFloat(value) : null;
  }
}

export class StringColumnToJSONTransformer implements ValueTransformer {
  to(value: object): string {
    return JSON.stringify(value);
  }

  from(value: string): object {
    return isJSON(value) ? JSON.parse(value) : null;
  }
}

export class CryptoAESTransformer implements ValueTransformer {
  private key: string;

  constructor(options: { encryptionKey: string }) {
    this.key = options.encryptionKey;
  }

  to(value: string): string {
    // return crypto.AES.encrypt(value, this.key).toString();
    return value;
  }

  from(value: string): string {
    return crypto.AES.decrypt(value, this.key).toString(crypto.enc.Utf8);
  }
}
