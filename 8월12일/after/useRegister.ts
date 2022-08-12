import { firstUpper } from "../utils/utils";
import {
  CheckCertificationNum,
  Condition,
  GetCertificationNum,
  SendCheckOverLap,
  StringObj,
  UserInformation,
  userInfoTypes,
} from "../types/types";
import useForm from "./useForm";
import useRequest from "./useRequest";
import { FormEvent } from "react";

const useRegister = (initial: UserInformation, condition: Condition) => {
  const {
    userInfo,
    informText,
    submitConditon,
    checkData,
    checkChange,
    setDataState,
    showInformText,
    setSubmitCondition,
    setUserInfo,
    setFalseCondition,
    removeInformTextState,
  } = useForm(initial, condition);
  const { sendDataWithParam, sendDataWithForm } = useRequest();

  const checkDuplicate: SendCheckOverLap = async (type, checkData) => {
    const apiType = firstUpper(type);
    const param = {
      [type]: checkData,
    };
    const { result } = await sendDataWithParam(`/exists${apiType}`, param);

    if (result === "true") {
      showInformText(type, "noValidDate");
      return;
    }

    setSubmitCondition({
      ...submitConditon,
      [`valid_${type}`]: true,
    });
    showInformText(type, "uniqueData");
  };

  const getCertificationNum: GetCertificationNum = async (
    registerToken,
    isSocial
  ) => {
    const formData = new FormData();
    formData.append("phone", userInfo["phone"] ?? "");
    formData.append("registerToken", registerToken ?? "");
    formData.append("isSocial", `${isSocial}`);

    const { result } = await sendDataWithForm(
      "/createVerifyPhoneUUID",
      formData
    );

    if (result !== "ok") {
      showInformText("phone", "noValidDate");
      return false;
    }

    return true;
  };

  const checkCertificationNum: CheckCertificationNum = async (
    registerToken,
    isSocial,
    certificationNumber
  ) => {
    const param = {
      phone: userInfo["phone"] ?? "",
      registerToken,
      isSocial,
      number: certificationNumber,
    };
    const { result } = await sendDataWithParam("/verifyPhoneUUID", param);
    if (result === "false") return false;

    setSubmitCondition({
      ...submitConditon,
      ["valid_phone"]: true,
    });
    return true;
  };

  const checkStates = (state: UserInformation) => {
    const resultCheckStates: StringObj = Object.entries(state).reduce(
      (acc, state) => {
        const [type, value] = state;
        return { ...acc, [type]: checkData(type as userInfoTypes, value) };
      },
      {}
    );

    return !Object.values(resultCheckStates).includes("validData")
      ? false
      : true;
  };

  const checkConditions = (state: Condition) => {
    const resultCheckConditions = Object.entries(state).filter(
      (condition) => !condition[1]
    );
    if (resultCheckConditions.length) {
      resultCheckConditions.forEach(([type]) => {
        setFalseCondition(type);
      });
      return false;
    }

    return true;
  };

  const registerSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const resultCheckStates = checkStates(userInfo);
    const resultCheckConditions = checkConditions(submitConditon);

    if (!resultCheckStates || !resultCheckConditions) return;

    e.currentTarget.submit();
  };

  return {
    userInfo,
    informText,
    submitConditon,
    setDataState,
    checkChange,
    checkDuplicate,
    getCertificationNum,
    checkCertificationNum,
    setUserInfo,
    removeInformTextState,
    registerSubmitHandler,
  };
};

export default useRegister;
