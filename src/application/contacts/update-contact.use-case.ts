import type { Contact } from "../../domain/entities/contact";
import type { ContactRepository } from "../../domain/repositories/contact.repository";
import type { UpdateContactInput } from "../../domain/repositories/contact.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { ValidationError } from "../../shared/errors/validation.error";

export class UpdateContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: number, input: UpdateContactInput): Promise<Contact> {
    const hasField =
      input.firstName !== undefined ||
      input.lastName !== undefined ||
      input.email !== undefined ||
      input.dateOfBirth !== undefined;

    if (!hasField) {
      throw new ValidationError("At least one field must be provided");
    }

    const existing = await this.contactRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Contact not found");
    }

    if (input.email && input.email !== existing.email) {
      const duplicate = await this.contactRepository.findByEmail(input.email);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError("A contact with this email already exists");
      }
    }

    return this.contactRepository.update(id, input);
  }
}
