import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ListPhonesUseCase } from "../../../application/phones/list-phones.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { toPhoneResponse } from "../../mappers/phone.mapper";

export class ListPhonesRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: ListPhonesUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const phones = await this.useCase.execute(id);
    return phones.map(toPhoneResponse);
  }
}
