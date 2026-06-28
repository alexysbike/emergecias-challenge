import type { Contact } from "../../domain/entities/contact";
import type { ContactRepository } from "../../domain/repositories/contact.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class GetContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: number): Promise<Contact> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError("Contact not found");
    }
    return contact;
  }
}
