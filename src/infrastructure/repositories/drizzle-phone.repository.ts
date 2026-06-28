import { and, eq } from "drizzle-orm";
import type { PhoneWithType } from "../../domain/entities/contact";
import type {
  CreatePhoneInput,
  PhoneRepository,
  UpdatePhoneInput,
} from "../../domain/repositories/phone.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";
import type { DbClient } from "../database/client";
import { persons, phoneTypes, phones } from "../database/schema";

export class DrizzlePhoneRepository implements PhoneRepository {
  constructor(private readonly db: DbClient) {}

  async contactExists(personId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: persons.id })
      .from(persons)
      .where(eq(persons.id, personId))
      .limit(1);
    return rows.length > 0;
  }

  async phoneTypeExists(phoneTypeId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: phoneTypes.id })
      .from(phoneTypes)
      .where(eq(phoneTypes.id, phoneTypeId))
      .limit(1);
    return rows.length > 0;
  }

  async create(input: CreatePhoneInput): Promise<PhoneWithType> {
    const [row] = await this.db
      .insert(phones)
      .values({
        number: input.number,
        personId: input.personId,
        phoneTypeId: input.phoneTypeId,
      })
      .returning({ id: phones.id });

    const phone = await this.findById(input.personId, row.id);
    if (!phone) {
      throw new Error("Failed to load created phone");
    }
    return phone;
  }

  async findById(personId: number, phoneId: number): Promise<PhoneWithType | null> {
    const rows = await this.db
      .select({
        id: phones.id,
        number: phones.number,
        personId: phones.personId,
        phoneTypeId: phones.phoneTypeId,
        phoneType: {
          id: phoneTypes.id,
          typeName: phoneTypes.typeName,
        },
      })
      .from(phones)
      .innerJoin(phoneTypes, eq(phoneTypes.id, phones.phoneTypeId))
      .where(and(eq(phones.id, phoneId), eq(phones.personId, personId)))
      .limit(1);

    if (rows.length === 0) return null;

    const [row] = rows;
    return {
      id: row.id,
      number: row.number,
      personId: row.personId,
      phoneTypeId: row.phoneTypeId,
      phoneType: row.phoneType,
    };
  }

  async listByPersonId(personId: number): Promise<PhoneWithType[]> {
    const rows = await this.db
      .select({
        id: phones.id,
        number: phones.number,
        personId: phones.personId,
        phoneTypeId: phones.phoneTypeId,
        phoneType: {
          id: phoneTypes.id,
          typeName: phoneTypes.typeName,
        },
      })
      .from(phones)
      .innerJoin(phoneTypes, eq(phoneTypes.id, phones.phoneTypeId))
      .where(eq(phones.personId, personId));

    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      personId: row.personId,
      phoneTypeId: row.phoneTypeId,
      phoneType: row.phoneType,
    }));
  }

  async update(personId: number, phoneId: number, input: UpdatePhoneInput): Promise<PhoneWithType> {
    const existing = await this.findById(personId, phoneId);
    if (!existing) {
      throw new NotFoundError("Phone not found");
    }

    await this.db
      .update(phones)
      .set({
        ...(input.number !== undefined && { number: input.number }),
        ...(input.phoneTypeId !== undefined && { phoneTypeId: input.phoneTypeId }),
      })
      .where(and(eq(phones.id, phoneId), eq(phones.personId, personId)));

    const updated = await this.findById(personId, phoneId);
    if (!updated) {
      throw new NotFoundError("Phone not found");
    }
    return updated;
  }

  async delete(personId: number, phoneId: number): Promise<void> {
    const existing = await this.findById(personId, phoneId);
    if (!existing) {
      throw new NotFoundError("Phone not found");
    }
    await this.db.delete(phones).where(and(eq(phones.id, phoneId), eq(phones.personId, personId)));
  }
}
