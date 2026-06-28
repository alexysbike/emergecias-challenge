import type { PhoneRepository } from "../../../../src/domain/repositories/phone.repository";
import { CreatePhoneUseCase } from "../../../../src/application/phones/create-phone.use-case";
import { NotFoundError } from "../../../../src/shared/errors/not-found.error";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

describe("CreatePhoneUseCase", () => {
  const input = {
    personId: 1,
    number: "+5491112345678",
    phoneTypeId: 1,
  };

  it("throws NotFoundError when contact does not exist", async () => {
    const repository: PhoneRepository = {
      contactExists: jest.fn().mockResolvedValue(false),
      phoneTypeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      listByPersonId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreatePhoneUseCase(repository);

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws ValidationError when phone type does not exist", async () => {
    const repository: PhoneRepository = {
      contactExists: jest.fn().mockResolvedValue(true),
      phoneTypeExists: jest.fn().mockResolvedValue(false),
      create: jest.fn(),
      findById: jest.fn(),
      listByPersonId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new CreatePhoneUseCase(repository);

    await expect(useCase.execute({ ...input, phoneTypeId: 99 })).rejects.toThrow(ValidationError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
