import type { Contact } from "../../domain/entities/contact";
import type { ContactRepository } from "../../domain/repositories/contact.repository";
import type { CreateContactInput } from "../../domain/repositories/contact.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { ValidationError } from "../../shared/errors/validation.error";

export class CreateContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(input: CreateContactInput): Promise<Contact> {
    const existing = await this.contactRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A contact with this email already exists");
    }

    if (input.phones?.length) {
      for (const phone of input.phones) {
        const exists = await this.contactRepository.phoneTypeExists(phone.phoneTypeId);
        if (!exists) {
          throw new ValidationError(`Phone type with id ${phone.phoneTypeId} does not exist`);
        }
      }
    }

    return this.contactRepository.create(input);
  }
}
