import { validateProps, scheduleValProps } from "../../common/types";

export function validate(values: validateProps) {
  let errors = {} as validateProps;

  if (!values.name) {
    errors.name = "Name is required";
  }
  if (!values.email) {
    errors.email = "Email address is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email address is invalid";
  }
  if (!values.message) {
    errors.message = "Message is required";
  }
  return errors;
}


export function scheduleVal(values: scheduleValProps) {
  let errors = {} as scheduleValProps;

  if (!values.eventName && !values.eventID ) {
    errors.eventName = "填寫事件名稱或 ID";
  }
  return errors;
}
