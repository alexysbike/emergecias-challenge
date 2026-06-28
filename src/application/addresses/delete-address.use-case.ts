import type { AddressRepository } from "../../domain/repositories/address.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";

export class DeleteAddressUseCase {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(personId: number, addressId: number): Promise<void> {
    const contactExists = await this.addressRepository.contactExists(personId);
    if (!contactExists) {
      throw new NotFoundError("Contact not found");
    }

    await this.addressRepository.delete(personId, addressId);
  }
}
