import type { Address } from "../../domain/entities/contact";

export function toAddressResponse(address: Address) {
  return {
    id: address.id,
    locality: address.locality,
    street: address.street,
    number: address.number,
    ...(address.notes !== undefined && { notes: address.notes }),
  };
}
