import type { Contact } from "../entities/contact";
import type {
  ContactListFilters,
  CreateContactInput,
  Paginated,
  UpdateContactInput,
} from "./contact.repository.types";

export interface ContactRepository {
  create(input: CreateContactInput): Promise<Contact>;
  findById(id: number): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  list(filters: ContactListFilters): Promise<Paginated<Contact>>;
  update(id: number, input: UpdateContactInput): Promise<Contact>;
  delete(id: number): Promise<void>;
  phoneTypeExists(phoneTypeId: number): Promise<boolean>;
}

export type {
  ContactListFilters,
  CreateContactInput,
  Paginated,
  UpdateContactInput,
} from "./contact.repository.types";
