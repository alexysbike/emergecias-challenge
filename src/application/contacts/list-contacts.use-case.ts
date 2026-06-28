import type { ContactRepository } from "../../domain/repositories/contact.repository";
import type {
  ContactListFilters,
  Paginated,
} from "../../domain/repositories/contact.repository.types";
import type { Contact } from "../../domain/entities/contact";

export class ListContactsUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(filters: ContactListFilters): Promise<Paginated<Contact>> {
    return this.contactRepository.list(filters);
  }
}
