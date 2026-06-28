export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePhoneInput {
  number: string;
  phoneTypeId: number;
}

export interface CreateAddressInput {
  locality: string;
  street: string;
  number: number;
  notes?: string;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phones?: CreatePhoneInput[];
  addresses?: CreateAddressInput[];
}

export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
}

export type ContactSearchMode = "all" | "email" | "personal" | "phone";

export interface ContactListFilters {
  page: number;
  limit: number;
  mode: ContactSearchMode;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  phoneType?: string;
}
