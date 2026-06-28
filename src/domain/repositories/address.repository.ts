import type { Address } from "../entities/contact";

export interface CreateAddressInput {
  personId: number;
  locality: string;
  street: string;
  number: number;
  notes?: string;
}

export interface UpdateAddressInput {
  locality?: string;
  street?: string;
  number?: number;
  notes?: string;
}

export interface AddressRepository {
  contactExists(personId: number): Promise<boolean>;
  create(input: CreateAddressInput): Promise<Address>;
  findById(personId: number, addressId: number): Promise<Address | null>;
  listByPersonId(personId: number): Promise<Address[]>;
  update(personId: number, addressId: number, input: UpdateAddressInput): Promise<Address>;
  delete(personId: number, addressId: number): Promise<void>;
}
