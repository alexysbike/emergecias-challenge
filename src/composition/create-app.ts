import type { Env } from "../shared/config/env";
import { loadEnv } from "../shared/config/env";
import type { DbClient } from "../infrastructure/database/client";
import { createDbClient } from "../infrastructure/database/client";
import { ensurePhoneTypesSeeded } from "../infrastructure/database/seed/run-seed";
import { DrizzleContactRepository } from "../infrastructure/repositories/drizzle-contact.repository";
import { DrizzleActivityRepository } from "../infrastructure/repositories/drizzle-activity.repository";
import { DrizzlePhoneRepository } from "../infrastructure/repositories/drizzle-phone.repository";
import { DrizzleAddressRepository } from "../infrastructure/repositories/drizzle-address.repository";
import { CreateContactUseCase } from "../application/contacts/create-contact.use-case";
import { ListContactsUseCase } from "../application/contacts/list-contacts.use-case";
import { GetContactUseCase } from "../application/contacts/get-contact.use-case";
import { UpdateContactUseCase } from "../application/contacts/update-contact.use-case";
import { DeleteContactUseCase } from "../application/contacts/delete-contact.use-case";
import { CreateActivityUseCase } from "../application/activities/create-activity.use-case";
import { ListActivitiesUseCase } from "../application/activities/list-activities.use-case";
import { CreatePhoneUseCase } from "../application/phones/create-phone.use-case";
import { ListPhonesUseCase } from "../application/phones/list-phones.use-case";
import { GetPhoneUseCase } from "../application/phones/get-phone.use-case";
import { UpdatePhoneUseCase } from "../application/phones/update-phone.use-case";
import { DeletePhoneUseCase } from "../application/phones/delete-phone.use-case";
import { CreateAddressUseCase } from "../application/addresses/create-address.use-case";
import { ListAddressesUseCase } from "../application/addresses/list-addresses.use-case";
import { GetAddressUseCase } from "../application/addresses/get-address.use-case";
import { UpdateAddressUseCase } from "../application/addresses/update-address.use-case";
import { DeleteAddressUseCase } from "../application/addresses/delete-address.use-case";
import { ContactsRouter } from "../presentation/routes/contacts/contacts.router";
import { HealthRouter } from "../presentation/routes/health/health.router";
import type { HttpRouter } from "../infrastructure/http/http-router";

export interface AppContext {
  env: Env;
  db: DbClient;
  routers: HttpRouter[];
}

export interface CreateAppOptions {
  databasePath?: string;
}

export async function createApp(options: CreateAppOptions = {}): Promise<AppContext> {
  const env = loadEnv();
  const databasePath = options.databasePath ?? env.databasePath;
  const db = createDbClient(databasePath);
  await ensurePhoneTypesSeeded(db);

  const contactRepository = new DrizzleContactRepository(db);
  const activityRepository = new DrizzleActivityRepository(db);
  const phoneRepository = new DrizzlePhoneRepository(db);
  const addressRepository = new DrizzleAddressRepository(db);

  const createContact = new CreateContactUseCase(contactRepository);
  const listContacts = new ListContactsUseCase(contactRepository);
  const getContact = new GetContactUseCase(contactRepository);
  const updateContact = new UpdateContactUseCase(contactRepository);
  const deleteContact = new DeleteContactUseCase(contactRepository);
  const createActivity = new CreateActivityUseCase(activityRepository);
  const listActivities = new ListActivitiesUseCase(activityRepository);
  const createPhone = new CreatePhoneUseCase(phoneRepository);
  const listPhones = new ListPhonesUseCase(phoneRepository);
  const getPhone = new GetPhoneUseCase(phoneRepository);
  const updatePhone = new UpdatePhoneUseCase(phoneRepository);
  const deletePhone = new DeletePhoneUseCase(phoneRepository);
  const createAddress = new CreateAddressUseCase(addressRepository);
  const listAddresses = new ListAddressesUseCase(addressRepository);
  const getAddress = new GetAddressUseCase(addressRepository);
  const updateAddress = new UpdateAddressUseCase(addressRepository);
  const deleteAddress = new DeleteAddressUseCase(addressRepository);

  const routers = [
    HealthRouter.create(),
    ContactsRouter.create({
      createContact,
      listContacts,
      getContact,
      updateContact,
      deleteContact,
      createActivity,
      listActivities,
      createPhone,
      listPhones,
      getPhone,
      updatePhone,
      deletePhone,
      createAddress,
      listAddresses,
      getAddress,
      updateAddress,
      deleteAddress,
    }),
  ];

  return { env: { ...env, databasePath }, db, routers };
}
