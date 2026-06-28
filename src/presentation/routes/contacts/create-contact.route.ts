import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { CreateContactUseCase } from "../../../application/contacts/create-contact.use-case";
import { createContactSchema } from "../../validators/contact.schemas";
import { toContactResponse } from "../../mappers/contact.mapper";

export class CreateContactRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.POST];

  constructor(private readonly useCase: CreateContactUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    const input = createContactSchema.parse(req.body);
    const contact = await this.useCase.execute(input);
    return toContactResponse(contact);
  }
}
