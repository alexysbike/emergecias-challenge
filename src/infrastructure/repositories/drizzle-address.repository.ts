import { and, eq } from "drizzle-orm";
import type { Address } from "../../domain/entities/contact";
import type {
  AddressRepository,
  CreateAddressInput,
  UpdateAddressInput,
} from "../../domain/repositories/address.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";
import type { DbClient } from "../database/client";
import { addresses, persons } from "../database/schema";

export class DrizzleAddressRepository implements AddressRepository {
  constructor(private readonly db: DbClient) {}

  async contactExists(personId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: persons.id })
      .from(persons)
      .where(eq(persons.id, personId))
      .limit(1);
    return rows.length > 0;
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const [row] = await this.db
      .insert(addresses)
      .values({
        personId: input.personId,
        locality: input.locality,
        street: input.street,
        number: input.number,
        notes: input.notes,
      })
      .returning();

    return {
      id: row.id,
      personId: row.personId,
      locality: row.locality,
      street: row.street,
      number: row.number,
      notes: row.notes ?? undefined,
    };
  }

  async findById(personId: number, addressId: number): Promise<Address | null> {
    const rows = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.personId, personId)))
      .limit(1);

    if (rows.length === 0) return null;

    const [row] = rows;
    return {
      id: row.id,
      personId: row.personId,
      locality: row.locality,
      street: row.street,
      number: row.number,
      notes: row.notes ?? undefined,
    };
  }

  async listByPersonId(personId: number): Promise<Address[]> {
    const rows = await this.db.select().from(addresses).where(eq(addresses.personId, personId));

    return rows.map((row) => ({
      id: row.id,
      personId: row.personId,
      locality: row.locality,
      street: row.street,
      number: row.number,
      notes: row.notes ?? undefined,
    }));
  }

  async update(personId: number, addressId: number, input: UpdateAddressInput): Promise<Address> {
    const existing = await this.findById(personId, addressId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }

    await this.db
      .update(addresses)
      .set({
        ...(input.locality !== undefined && { locality: input.locality }),
        ...(input.street !== undefined && { street: input.street }),
        ...(input.number !== undefined && { number: input.number }),
        ...(input.notes !== undefined && { notes: input.notes }),
      })
      .where(and(eq(addresses.id, addressId), eq(addresses.personId, personId)));

    const updated = await this.findById(personId, addressId);
    if (!updated) {
      throw new NotFoundError("Address not found");
    }
    return updated;
  }

  async delete(personId: number, addressId: number): Promise<void> {
    const existing = await this.findById(personId, addressId);
    if (!existing) {
      throw new NotFoundError("Address not found");
    }
    await this.db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.personId, personId)));
  }
}
