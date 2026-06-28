import type { Address } from "../../domain/entities/contact";
import type { AddressRepository } from "../../domain/repositories/address.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class GetAddressUseCase {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(personId: number, addressId: number): Promise<Address> {
    const contactExists = await this.addressRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    const address = await this.addressRepository.findById(personId, addressId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    return address;
  }
}
