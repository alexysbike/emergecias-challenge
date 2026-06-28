import type { PhoneWithType } from "../entities/contact";

export interface CreatePhoneInput {
  personId: number;
  number: string;
  phoneTypeId: number;
}

export interface UpdatePhoneInput {
  number?: string;
  phoneTypeId?: number;
}

export interface PhoneRepository {
  contactExists(personId: number): Promise<boolean>;
  phoneTypeExists(phoneTypeId: number): Promise<boolean>;
  create(input: CreatePhoneInput): Promise<PhoneWithType>;
  findById(personId: number, phoneId: number): Promise<PhoneWithType | null>;
  listByPersonId(personId: number): Promise<PhoneWithType[]>;
  update(personId: number, phoneId: number, input: UpdatePhoneInput): Promise<PhoneWithType>;
  delete(personId: number, phoneId: number): Promise<void>;
}
