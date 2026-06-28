import type { PhoneRepository } from "../../domain/repositories/phone.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class DeletePhoneUseCase {
  constructor(private readonly phoneRepository: PhoneRepository) {}

  async execute(personId: number, phoneId: number): Promise<void> {
    const contactExists = await this.phoneRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    await this.phoneRepository.delete(personId, phoneId);
  }
}
