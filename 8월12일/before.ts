import {
  InformText,
  SendCheckOverLap,
  RemoveInformTextState,
  StringObj,
  UserInformationRe,
  Condition,
  SetData,
  CheckData,
  userInfoTypes,
  GetCertificationNum,
  CheckCertificationNum,
} from "../types/types";
import { FormEvent, useState } from "react";
import { checkBlank, checkFormat, firstUpper } from "../utils/utils";
import { paxios } from "./useAxios";

const useForm = (initial: UserInformationRe, condition: Condition) => {
  const [userInfo, setUserInfo] = useState<UserInformationRe>(initial);
  const [submitConditon, setSubmitCondition] = useState<Condition>(condition);
  const [informText, setInformText] = useState<InformText>(initial);
  const [userTermsCheck, setUserTermsCheck] = useState(false);

  const setDataState: SetData = (type, value) => {
    setUserInfo({ ...userInfo, [type]: value });
  };

  const showInformText: SetData = (type, errorType) => {
    setInformText((informText) => ({ ...informText, [type]: errorType }));
  };

  const checkData: CheckData = (type, value) => {
    const resultCheckFormat = checkFormat(type, value);
    const resultCheckBlank = checkBlank(value);

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

  const sendCheckDuplicate: SendCheckOverLap = (type, checkData) => {
    const apiType = firstUpper(type);
    paxios
      .get(`/exists${apiType}`, {
        params: {
          [type]: checkData,
        },
      })
      .then(({ data }) => {
        if (data.result === "true") {
          showInformText(type, "noValidDate");
          return;
        }
        setSubmitCondition({
          ...submitConditon,
          [`valid_${type}`]: true,
        });
        showInformText(type, "uniqueData");
      })
      .catch(() => null);
  };

  const getCertificationNum: GetCertificationNum = (url, formData, type) => {
    const result = paxios
      .post(url, formData, {
        headers: {
          "Content-Type": " application/json",
        },
      })
      .then(({ data }) => {
        if (data?.result === "alreadyExistsPhoneNumber") {
          showInformText(type, "noValidDate");
          return false;
        }
        return true;
      })
      .catch(() => {
        return false;
      });

    return result;
  };

  const checkCertificationNum: CheckCertificationNum = (
    url,
    paramObj,
    type
  ) => {
    const result = paxios
      .get(url, {
        params: paramObj,
      })
      .then(({ data }) => {
        if (data?.result === "false") return false;

        setSubmitCondition({
          ...submitConditon,
          [`valid_${type}`]: true,
        });
        return true;
      })
      .catch(() => {
        return false;
      });

    return result;
  };

  const checkStates = (state: UserInformationRe) => {
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

    if (!userTermsCheck) {
      showInformText("userTermsCheck", "notChecked");
    }

    if (!resultCheckStates || !resultCheckConditions || !userTermsCheck) return;

    e.currentTarget.submit();
  };

  return {
    userInfo,
    informText,
    userTermsCheck,
    submitConditon,
    checkChange,
    setUserInfo,
    setInformText,
    setUserTermsCheck,
    removeInformTextState,
    sendCheckDuplicate,
    getCertificationNum,
    checkCertificationNum,
    registerSubmitHandler,
  };
};

export default useForm;
