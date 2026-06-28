import type { Contact } from "../../domain/entities/contact";
import type { Paginated } from "../../domain/repositories/contact.repository.types";

export function toContactResponse(contact: Contact) {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    dateOfBirth: contact.dateOfBirth,
    phones: contact.phones.map((phone) => ({
      id: phone.id,
      number: phone.number,
      phoneTypeId: phone.phoneTypeId,
      phoneType: {
        id: phone.phoneType.id,
        typeName: phone.phoneType.typeName,
      },
    })),
    addresses: contact.addresses.map((address) => ({
      id: address.id,
      locality: address.locality,
      street: address.street,
      number: address.number,
      ...(address.notes !== undefined && { notes: address.notes }),
    })),
  };
}

export function toPaginatedContactsResponse(result: Paginated<Contact>) {
  return {
    data: result.data.map(toContactResponse),
    pagination: result.pagination,
  };
}

export function toListContactsFilters(query: {
  page: number;
  limit: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  phoneType?: string;
}) {
  if (query.email) {
    return {
      page: query.page,
      limit: query.limit,
      mode: "email" as const,
      email: query.email,
    };
  }

  if (query.phoneNumber && query.phoneType) {
    return {
      page: query.page,
      limit: query.limit,
      mode: "phone" as const,
      phoneNumber: query.phoneNumber,
      phoneType: query.phoneType,
    };
  }

  if (query.firstName || query.lastName || query.dateOfBirth) {
    return {
      page: query.page,
      limit: query.limit,
      mode: "personal" as const,
      firstName: query.firstName,
      lastName: query.lastName,
      dateOfBirth: query.dateOfBirth,
    };
  }

  return {
    page: query.page,
    limit: query.limit,
    mode: "all" as const,
  };
}
