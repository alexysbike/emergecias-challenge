import type { PhoneWithType } from "../../domain/entities/contact";
import type {
  CreatePhoneInput,
  PhoneRepository,
} from "../../domain/repositories/phone.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { ValidationError } from "../../shared/errors/validation.error";

export class CreatePhoneUseCase {
  constructor(private readonly phoneRepository: PhoneRepository) {}

  async execute(input: CreatePhoneInput): Promise<PhoneWithType> {
    const contactExists = await this.phoneRepository.contactExists(input.personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    const phoneTypeExists = await this.phoneRepository.phoneTypeExists(input.phoneTypeId);
    if (!phoneTypeExists) {
      throw new ValidationError(`Phone type with id ${input.phoneTypeId} does not exist`);
    }

    return this.phoneRepository.create(input);
  }
}
