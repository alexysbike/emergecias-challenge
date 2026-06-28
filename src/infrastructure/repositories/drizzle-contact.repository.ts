import { and, count, eq, inArray, sql } from "drizzle-orm";
import type { Contact } from "../../domain/entities/contact";
import type { ContactRepository } from "../../domain/repositories/contact.repository";
import type {
  ContactListFilters,
  CreateContactInput,
  Paginated,
  UpdateContactInput,
} from "../../domain/repositories/contact.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { NotFoundError } from "../../shared/errors/not-found.error";
import type { DbClient } from "../database/client";
import { addresses, persons, phoneTypes, phones } from "../database/schema";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

export class DrizzleContactRepository implements ContactRepository {
  constructor(private readonly db: DbClient) {}

  async phoneTypeExists(phoneTypeId: number): Promise<boolean> {
    const rows = await this.db
      .select({ id: phoneTypes.id })
      .from(phoneTypes)
      .where(eq(phoneTypes.id, phoneTypeId))
      .limit(1);
    return rows.length > 0;
  }

  async create(input: CreateContactInput): Promise<Contact> {
    try {
      const personId = this.db.transaction((tx) => {
        const person = tx
          .insert(persons)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            dateOfBirth: input.dateOfBirth,
          })
          .returning({ id: persons.id })
          .get();

        if (input.phones?.length) {
          tx.insert(phones)
            .values(
              input.phones.map((phone) => ({
                number: phone.number,
                personId: person.id,
                phoneTypeId: phone.phoneTypeId,
              }))
            )
            .run();
        }

        if (input.addresses?.length) {
          tx.insert(addresses)
            .values(
              input.addresses.map((address) => ({
                personId: person.id,
                locality: address.locality,
                street: address.street,
                number: address.number,
                notes: address.notes,
              }))
            )
            .run();
        }

        return person.id;
      });

      const contact = await this.findById(personId);
      if (!contact) {
        throw new Error("Failed to load created contact");
      }
      return contact;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError("A contact with this email already exists");
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Contact | null> {
    const personRows = await this.db.select().from(persons).where(eq(persons.id, id)).limit(1);

    if (personRows.length === 0) return null;

    const [person] = personRows;
    const phoneRows = await this.loadPhones(id);
    const addressRows = await this.loadAddresses(id);

    return this.toContact(person, phoneRows, addressRows);
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const personRows = await this.db
      .select()
      .from(persons)
      .where(eq(persons.email, email))
      .limit(1);

    if (personRows.length === 0) return null;

    const [person] = personRows;
    const phoneRows = await this.loadPhones(person.id);
    const addressRows = await this.loadAddresses(person.id);

    return this.toContact(person, phoneRows, addressRows);
  }

  async list(filters: ContactListFilters): Promise<Paginated<Contact>> {
    const offset = (filters.page - 1) * filters.limit;
    let personIds: number[] | null = null;

    if (filters.mode === "email" && filters.email) {
      const rows = await this.db
        .select({ id: persons.id })
        .from(persons)
        .where(eq(persons.email, filters.email));
      personIds = rows.map((r) => r.id);
    } else if (filters.mode === "phone" && filters.phoneNumber && filters.phoneType) {
      const rows = await this.db
        .select({ id: persons.id })
        .from(persons)
        .innerJoin(phones, eq(phones.personId, persons.id))
        .innerJoin(phoneTypes, eq(phoneTypes.id, phones.phoneTypeId))
        .where(
          and(eq(phones.number, filters.phoneNumber), eq(phoneTypes.typeName, filters.phoneType))
        );
      personIds = rows.map((r) => r.id);
    } else if (filters.mode === "personal") {
      const conditions = [];
      if (filters.firstName) {
        conditions.push(
          sql`lower(${persons.firstName}) like lower(${"%" + filters.firstName + "%"})`
        );
      }
      if (filters.lastName) {
        conditions.push(
          sql`lower(${persons.lastName}) like lower(${"%" + filters.lastName + "%"})`
        );
      }
      if (filters.dateOfBirth) {
        conditions.push(eq(persons.dateOfBirth, filters.dateOfBirth));
      }

      const rows = await this.db
        .select({ id: persons.id })
        .from(persons)
        .where(and(...conditions));
      personIds = rows.map((r) => r.id);
    }

    let total: number;
    let pagePersons: (typeof persons.$inferSelect)[];

    if (personIds !== null) {
      total = personIds.length;
      const pageIds = personIds.slice(offset, offset + filters.limit);
      if (pageIds.length === 0) {
        pagePersons = [];
      } else {
        pagePersons = await this.db
          .select()
          .from(persons)
          .where(
            sql`${persons.id} IN (${sql.join(
              pageIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          );
      }
    } else {
      const [totalRow] = await this.db.select({ value: count() }).from(persons);
      total = totalRow?.value ?? 0;

      pagePersons = await this.db.select().from(persons).limit(filters.limit).offset(offset);
    }

    const pageIds = pagePersons.map((person) => person.id);
    const [allPhoneRows, allAddressRows] =
      pageIds.length > 0
        ? await Promise.all([
            this.loadPhonesForPersonIds(pageIds),
            this.loadAddressesForPersonIds(pageIds),
          ])
        : [[], []];
    const phonesByPersonId = this.groupByPersonId(allPhoneRows);
    const addressesByPersonId = this.groupByPersonId(allAddressRows);

    const data = pagePersons.map((person) =>
      this.toContact(
        person,
        phonesByPersonId.get(person.id) ?? [],
        addressesByPersonId.get(person.id) ?? []
      )
    );

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit),
      },
    };
  }

  async update(id: number, input: UpdateContactInput): Promise<Contact> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("Contact not found");
    }

    try {
      await this.db
        .update(persons)
        .set({
          ...(input.firstName !== undefined && { firstName: input.firstName }),
          ...(input.lastName !== undefined && { lastName: input.lastName }),
          ...(input.email !== undefined && { email: input.email }),
          ...(input.dateOfBirth !== undefined && { dateOfBirth: input.dateOfBirth }),
        })
        .where(eq(persons.id, id));
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError("A contact with this email already exists");
      }
      throw error;
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundError("Contact not found");
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("Contact not found");
    }
    await this.db.delete(persons).where(eq(persons.id, id));
  }

  private async loadPhones(personId: number) {
    return this.loadPhonesForPersonIds([personId]);
  }

  private async loadPhonesForPersonIds(personIds: number[]) {
    if (personIds.length === 0) return [];

    return this.db
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
      .where(inArray(phones.personId, personIds));
  }

  private async loadAddresses(personId: number) {
    return this.loadAddressesForPersonIds([personId]);
  }

  private async loadAddressesForPersonIds(personIds: number[]) {
    if (personIds.length === 0) return [];

    return this.db.select().from(addresses).where(inArray(addresses.personId, personIds));
  }

  private groupByPersonId<T extends { personId: number }>(rows: T[]): Map<number, T[]> {
    const grouped = new Map<number, T[]>();
    for (const row of rows) {
      const existing = grouped.get(row.personId);
      if (existing) {
        existing.push(row);
      } else {
        grouped.set(row.personId, [row]);
      }
    }
    return grouped;
  }

  private toContact(
    person: typeof persons.$inferSelect,
    phoneRows: Awaited<ReturnType<DrizzleContactRepository["loadPhones"]>>,
    addressRows: Awaited<ReturnType<DrizzleContactRepository["loadAddresses"]>>
  ): Contact {
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      dateOfBirth: person.dateOfBirth,
      phones: phoneRows.map((row) => ({
        id: row.id,
        number: row.number,
        personId: row.personId,
        phoneTypeId: row.phoneTypeId,
        phoneType: row.phoneType,
      })),
      addresses: addressRows.map((row) => ({
        id: row.id,
        personId: row.personId,
        locality: row.locality,
        street: row.street,
        number: row.number,
        notes: row.notes ?? undefined,
      })),
    };
  }
}
