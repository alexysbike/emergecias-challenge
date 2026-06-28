import { HttpRouter } from "../../../infrastructure/http/http-router";
import type { CreateContactUseCase } from "../../../application/contacts/create-contact.use-case";
import type { ListContactsUseCase } from "../../../application/contacts/list-contacts.use-case";
import type { GetContactUseCase } from "../../../application/contacts/get-contact.use-case";
import type { UpdateContactUseCase } from "../../../application/contacts/update-contact.use-case";
import type { DeleteContactUseCase } from "../../../application/contacts/delete-contact.use-case";
import { CreateContactRoute } from "./create-contact.route";
import { ListContactsRoute } from "./list-contacts.route";
import { GetContactRoute } from "./get-contact.route";
import { UpdateContactRoute } from "./update-contact.route";
import { DeleteContactRoute } from "./delete-contact.route";

export interface ContactDeps {
  createContact: CreateContactUseCase;
  listContacts: ListContactsUseCase;
  getContact: GetContactUseCase;
  updateContact: UpdateContactUseCase;
  deleteContact: DeleteContactUseCase;
}

export interface ContactNestedRouters {
  activities: HttpRouter;
  phones: HttpRouter;
  addresses: HttpRouter;
}

export class ContactsRouter extends HttpRouter {
  readonly path = "/contacts";

  static create(deps: ContactDeps, nested: ContactNestedRouters): ContactsRouter {
    return new ContactsRouter()
      .register(
        new CreateContactRoute(deps.createContact),
        new ListContactsRoute(deps.listContacts),
        new GetContactRoute(deps.getContact),
        new UpdateContactRoute(deps.updateContact),
        new DeleteContactRoute(deps.deleteContact)
      )
      .mount(nested.activities, nested.phones, nested.addresses);
  }
}
