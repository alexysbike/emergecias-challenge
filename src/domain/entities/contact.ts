export type ActivityType = "call" | "meeting" | "email";

export interface PhoneType {
  id: number;
  typeName: string;
}

export interface Phone {
  id: number;
  number: string;
  personId: number;
  phoneTypeId: number;
}

export interface PhoneWithType extends Phone {
  phoneType: PhoneType;
}

export interface Address {
  id: number;
  personId: number;
  locality: string;
  street: string;
  number: number;
  notes?: string;
}

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

export interface Contact extends Person {
  phones: PhoneWithType[];
  addresses: Address[];
}
