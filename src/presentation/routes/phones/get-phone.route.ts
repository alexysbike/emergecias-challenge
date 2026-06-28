import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { GetPhoneUseCase } from "../../../application/phones/get-phone.use-case";
import { phoneParamsSchema } from "../../validators/common.schemas";
import { toPhoneResponse } from "../../mappers/phone.mapper";

export class GetPhoneRoute extends HttpRoute {
  readonly path = "/:phoneId";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: GetPhoneUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id, phoneId } = phoneParamsSchema.parse(req.params);
    const phone = await this.useCase.execute(id, phoneId);
    return toPhoneResponse(phone);
  }
}
