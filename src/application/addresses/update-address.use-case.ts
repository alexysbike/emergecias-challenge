import type { Address } from "../../domain/entities/contact";
import type {
  AddressRepository,
  UpdateAddressInput,
} from "../../domain/repositories/address.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class UpdateAddressUseCase {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(personId: number, addressId: number, input: UpdateAddressInput): Promise<Address> {
    const contactExists = await this.addressRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    return this.addressRepository.update(personId, addressId, input);
  }
}
