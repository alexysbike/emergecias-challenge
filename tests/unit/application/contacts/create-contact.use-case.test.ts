import type { ContactRepository } from "../../../../src/domain/repositories/contact.repository";
import type { Contact } from "../../../../src/domain/entities/contact";
import { CreateContactUseCase } from "../../../../src/application/contacts/create-contact.use-case";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

function createMockContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 1,
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    dateOfBirth: "1990-05-15",
    phones: [],
    addresses: [],
    ...overrides,
  };
}

describe("CreateContactUseCase", () => {
  const input = {
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    dateOfBirth: "1990-05-15",
  };

  it("creates a contact when email is unique", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      phoneTypeExists: jest.fn(),
      create: jest.fn().mockResolvedValue(createMockContact()),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreateContactUseCase(repository);
    const result = await useCase.execute(input);

    expect(result.email).toBe("ana@example.com");
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it("throws ConflictError when email already exists", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn().mockResolvedValue(createMockContact()),
      phoneTypeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreateContactUseCase(repository);

    await expect(useCase.execute(input)).rejects.toThrow(ConflictError);
  });

  it("throws ValidationError when phone type does not exist", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      phoneTypeExists: jest.fn().mockResolvedValue(false),
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreateContactUseCase(repository);

    await expect(
      useCase.execute({
        ...input,
        phones: [{ number: "+5491112345678", phoneTypeId: 99 }],
      })
    ).rejects.toThrow(ValidationError);
  });
});
