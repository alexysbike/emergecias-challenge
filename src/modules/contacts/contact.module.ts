import type { AppModule, ModuleContext } from "../../composition/module-context";
import { CreateContactUseCase } from "../../application/contacts/create-contact.use-case";
import { ListContactsUseCase } from "../../application/contacts/list-contacts.use-case";
import { GetContactUseCase } from "../../application/contacts/get-contact.use-case";
import { UpdateContactUseCase } from "../../application/contacts/update-contact.use-case";
import { DeleteContactUseCase } from "../../application/contacts/delete-contact.use-case";
import { DrizzleContactRepository } from "../../infrastructure/repositories/drizzle-contact.repository";
import {
  ContactsRouter,
  type ContactNestedRouters,
} from "../../presentation/routes/contacts/contacts.router";

export function createContactModule(ctx: ModuleContext, nested: ContactNestedRouters): AppModule {
  const repository = new DrizzleContactRepository(ctx.db);

  const deps = {
    createContact: new CreateContactUseCase(repository),
    listContacts: new ListContactsUseCase(repository),
    getContact: new GetContactUseCase(repository),
    updateContact: new UpdateContactUseCase(repository),
    deleteContact: new DeleteContactUseCase(repository),
  };

  return {
    name: "contacts",
    routers: [ContactsRouter.create(deps, nested)],
  };
}
