import { saveUserEvent as userEventSaver } from "../gateways/userEvent/userEvent.gateway";
import { UserEvent } from "../models/models";

export const saveUserEvent = (userEvent: UserEvent) => userEventSaver(userEvent);
