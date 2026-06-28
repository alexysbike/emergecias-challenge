import type { Address } from "../../domain/entities/contact";
import type {
  AddressRepository,
  CreateAddressInput,
} from "../../domain/repositories/address.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class CreateAddressUseCase {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(input: CreateAddressInput): Promise<Address> {
    const contactExists = await this.addressRepository.contactExists(input.personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    return this.addressRepository.create(input);
  }
}
