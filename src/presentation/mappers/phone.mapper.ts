import type { PhoneWithType } from "../../domain/entities/contact";

export function toPhoneResponse(phone: PhoneWithType) {
  return {
    id: phone.id,
    number: phone.number,
    phoneTypeId: phone.phoneTypeId,
    phoneType: {
      id: phone.phoneType.id,
      typeName: phone.phoneType.typeName,
    },
  };
}
