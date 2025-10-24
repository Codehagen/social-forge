import { nanoid } from "nanoid";

export function generateId(length = 12) {
  return nanoid(length);
}
