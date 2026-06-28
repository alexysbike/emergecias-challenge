import type { ContactRepository } from "../../domain/repositories/contact.repository";

export class DeleteContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
