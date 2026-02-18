import { validateProps, scheduleValProps, userValProps } from "../../common/types";

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

  if (!values.eventID) {
    errors.eventID = "活動 ID 為必填欄位";
  }
  if (!values.eventName) {
    errors.eventName = "活動名稱為必填欄位";
  }
  if (!values.eventStartDate) {
    errors.eventStartDate = "開始日期為必填欄位";
  }
  if (!values.eventStartTime) {
    errors.eventStartTime = "開始時間為必填欄位";
  }
  if (!values.eventEndDate) {
    errors.eventEndDate = "結束日期為必填欄位";
  }
  if (!values.eventEndTime) {
    errors.eventEndTime = "結束時間為必填欄位";
  }
  if (!values.eventContent) {
    errors.eventContent = "活動內容為必填欄位";
  }
  return errors;
}



export function userVal(values: userValProps) {
  let errors = {} as userValProps;


  //   account: string;
  // name: string;
  // group: str

  if (!values.account) {
    errors.account = "活動 ID 為必填欄位";
  }
  if (!values.name) {
    errors.name = "活動名稱為必填欄位";
  }
  if (!values.group) {
    errors.group = "開始日期為必填欄位";
  }
  return errors;
}


