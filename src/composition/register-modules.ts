import type { HttpRouter } from "../infrastructure/http/http-router";
import type { AppModule, ModuleContext } from "./module-context";
import { createActivityModule } from "../modules/activities/activity.module";
import { createAddressModule } from "../modules/addresses/address.module";
import { createContactModule } from "../modules/contacts/contact.module";
import { createHealthModule } from "../modules/health/health.module";
import { createPhoneModule } from "../modules/phones/phone.module";

type LeafModuleFactory = (ctx: ModuleContext) => AppModule;

const leafModuleFactories: LeafModuleFactory[] = [
  createHealthModule,
  createActivityModule,
  createPhoneModule,
  createAddressModule,
];

export interface BootstrapResult {
  routers: HttpRouter[];
}

async function runModuleInit(modules: AppModule[], ctx: ModuleContext): Promise<void> {
  await Promise.all(
    modules.map(async (module) => {
      if (module.onInit) {
        await module.onInit(ctx);
      }
    })
  );
}

function collectRouters(...modules: AppModule[]): HttpRouter[] {
  return modules.flatMap((module) => module.routers ?? []);
}

export async function bootstrapModules(ctx: ModuleContext): Promise<BootstrapResult> {
  const leafModules = leafModuleFactories.map((factory) => factory(ctx));

  const activities = leafModules.find((module) => module.name === "activities")!;
  const phones = leafModules.find((module) => module.name === "phones")!;
  const addresses = leafModules.find((module) => module.name === "addresses")!;

  const contactModule = createContactModule(ctx, {
    activities: activities.nested!.activities,
    phones: phones.nested!.phones,
    addresses: addresses.nested!.addresses,
  });

  const allModules = [...leafModules, contactModule];

  await runModuleInit(allModules, ctx);

  return {
    routers: collectRouters(...allModules),
  };
}
