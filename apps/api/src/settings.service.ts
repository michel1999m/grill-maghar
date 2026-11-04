import { BadRequestException, Injectable } from "@nestjs/common";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export type Settings = { deliveryFee: number };

const DATA_DIR = join(__dirname, "..", "data");
const DATA_FILE = join(DATA_DIR, "settings.json");
const defaults: Settings = { deliveryFee: 15 };

@Injectable()
export class SettingsService {
  private settings: Settings = this.load();

  private load(): Settings {
    try {
      if (existsSync(DATA_FILE)) return { ...defaults, ...JSON.parse(readFileSync(DATA_FILE, "utf-8")) };
    } catch {
      // fall back to defaults if the file is missing or corrupt
    }
    return { ...defaults };
  }

  get() {
    return this.settings;
  }

  update(input: Partial<Settings>) {
    if (input.deliveryFee !== undefined) {
      const fee = Number(input.deliveryFee);
      if (!Number.isFinite(fee) || fee < 0) throw new BadRequestException("דמי משלוח לא תקינים");
      this.settings.deliveryFee = fee;
    }
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(DATA_FILE, JSON.stringify(this.settings, null, 2));
    } catch {
      // best-effort persistence; the in-memory value still applies to this process
    }
    return this.settings;
  }
}
