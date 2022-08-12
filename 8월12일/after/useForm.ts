import {
  InformText,
  RemoveInformTextState,
  UserInformation,
  Condition,
  SetData,
  CheckData,
  userInfoTypes,
} from "../types/types";
import { useState } from "react";
import { checkBlank, checkFormat } from "../utils/utils";

const useForm = (initial: UserInformation, condition: Condition) => {
  const [userInfo, setUserInfo] = useState<UserInformation>(initial);
  const [submitConditon, setSubmitCondition] = useState<Condition>(condition);
  const [informText, setInformText] = useState<InformText>({
    ...userInfo,
    userTermsCheck: "",
  });

  const setDataState: SetData = (type, value) => {
    setUserInfo({ ...userInfo, [type]: value });
  };

  const showInformText: SetData = (type, errorType) => {
    setInformText((informText) => ({ ...informText, [type]: errorType }));
  };

  const checkData: CheckData = (type, value) => {
    const resultCheckFormat = checkFormat(type, value);
    const resultCheckBlank =
      type !== "userTermsCheck" ? checkBlank(value) : true;

    setUserInfo({ ...userInfo, [type]: value });

    if (!resultCheckFormat || !resultCheckBlank) {
      const errorType = !resultCheckBlank ? "blankData" : "inValidFormat";

      showInformText(type, errorType);
      return false;
    }

    showInformText(type, "validData");
    return true;
  };

  const setFalseCondition = (type: string) => {
    const [, splitedType] = type.split("_");
    showInformText(splitedType as userInfoTypes, "noValidDate");
    return false;
  };

  const checkChange: CheckData = (type, value) => {
    if (!checkData(type, value)) {
      return false;
    }

    setDataState(type, value);
    return true;
  };

  const removeInformTextState: RemoveInformTextState = (type) => {
    setInformText({ ...informText, [type]: "" });
  };

  return {
    userInfo,
    informText,
    submitConditon,
    checkData,
    setDataState,
    setSubmitCondition,
    showInformText,
    checkChange,
    setUserInfo,
    setInformText,
    setFalseCondition,
    removeInformTextState,
  };
};

export default useForm;
