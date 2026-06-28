import { HttpRouter } from "../../../infrastructure/http/http-router";
import type { CreatePhoneUseCase } from "../../../application/phones/create-phone.use-case";
import type { ListPhonesUseCase } from "../../../application/phones/list-phones.use-case";
import type { GetPhoneUseCase } from "../../../application/phones/get-phone.use-case";
import type { UpdatePhoneUseCase } from "../../../application/phones/update-phone.use-case";
import type { DeletePhoneUseCase } from "../../../application/phones/delete-phone.use-case";
import { CreatePhoneRoute } from "./create-phone.route";
import { ListPhonesRoute } from "./list-phones.route";
import { GetPhoneRoute } from "./get-phone.route";
import { UpdatePhoneRoute } from "./update-phone.route";
import { DeletePhoneRoute } from "./delete-phone.route";

export interface PhoneDeps {
  createPhone: CreatePhoneUseCase;
  listPhones: ListPhonesUseCase;
  getPhone: GetPhoneUseCase;
  updatePhone: UpdatePhoneUseCase;
  deletePhone: DeletePhoneUseCase;
}

export class PhonesRouter extends HttpRouter {
  readonly path = "/:id/phones";

  static create(deps: PhoneDeps): PhonesRouter {
    return new PhonesRouter().register(
      new CreatePhoneRoute(deps.createPhone),
      new ListPhonesRoute(deps.listPhones),
      new GetPhoneRoute(deps.getPhone),
      new UpdatePhoneRoute(deps.updatePhone),
      new DeletePhoneRoute(deps.deletePhone)
    );
  }
}
