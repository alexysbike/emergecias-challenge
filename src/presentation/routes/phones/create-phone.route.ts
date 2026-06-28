import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { CreatePhoneUseCase } from "../../../application/phones/create-phone.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { createPhoneSchema } from "../../validators/phone.schemas";
import { toPhoneResponse } from "../../mappers/phone.mapper";

export class CreatePhoneRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.POST];

  constructor(private readonly useCase: CreatePhoneUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const input = createPhoneSchema.parse(req.body);
    const phone = await this.useCase.execute({
      personId: id,
      ...input,
    });
    return toPhoneResponse(phone);
  }
}
