import type { PhoneWithType } from "../../domain/entities/contact";
import type { PhoneRepository } from "../../domain/repositories/phone.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class GetPhoneUseCase {
  constructor(private readonly phoneRepository: PhoneRepository) {}

  async execute(personId: number, phoneId: number): Promise<PhoneWithType> {
    const contactExists = await this.phoneRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    const phone = await this.phoneRepository.findById(personId, phoneId);
    if (!phone) {
      throw new NotFoundError("Phone not found");
    }

    return phone;
  }
}
