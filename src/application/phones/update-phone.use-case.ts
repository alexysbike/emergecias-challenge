import type { PhoneWithType } from "../../domain/entities/contact";
import type { PhoneRepository, UpdatePhoneInput } from "../../domain/repositories/phone.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { ValidationError } from "../../shared/errors/validation.error";

export class UpdatePhoneUseCase {
  constructor(private readonly phoneRepository: PhoneRepository) {}

  async execute(
    personId: number,
    phoneId: number,
    input: UpdatePhoneInput
  ): Promise<PhoneWithType> {
    const contactExists = await this.phoneRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    if (input.phoneTypeId !== undefined) {
      const phoneTypeExists = await this.phoneRepository.phoneTypeExists(input.phoneTypeId);
      if (!phoneTypeExists) {
        throw new ValidationError(`Phone type with id ${input.phoneTypeId} does not exist`);
      }
    }

    return this.phoneRepository.update(personId, phoneId, input);
  }
}
