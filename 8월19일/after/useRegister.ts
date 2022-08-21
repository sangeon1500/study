import {
  Condition,
  GetCertificationNum,
  CheckCertificationNum,
  SendCheckDuplicate,
  userInfoTypes,
} from "../types/types"
import { FormEvent, useState } from "react"
import { checkFormat, firstUpper } from "../utils/utils"
import useRequest from "./useRequest"

const useForm = (condition: Condition) => {
  const [wasSubmited, setWasSubmited] = useState(false)
  const [submitConditon, setSubmitCondition] = useState<Condition>(condition)
  const { sendDataWithParam, sendDataWithForm } = useRequest()

  const sendCheckDuplicate: SendCheckDuplicate = (type, value) => {
    const apiType = firstUpper(type)

    return sendDataWithParam(`/exists${apiType}`, { [type]: value }).then(
      (data) => {
        if (data.result === "true") {
          return "duplicateData"
        }
        setSubmitCondition({
          ...submitConditon,
          [`valid_${type}`]: true,
        })
        return "uniqueData"
      },
    )
  }

  const getCertificationNum: GetCertificationNum = (url, formData) => {
    return sendDataWithForm(url, formData).then((data) => {
      if (data.result === "alreadyExistsPhoneNumber") {
        return "duplicateData"
      }
      return "uniqueData"
    })
  }

  const checkCertificationNum: CheckCertificationNum = (
    url,
    paramObj,
    type,
  ) => {
    return sendDataWithForm(url, paramObj).then((data) => {
      if (data.result === "true") {
        return "duplicateData"
      }
      setSubmitCondition({
        ...submitConditon,
        [`valid_${type}`]: true,
      })
      return "validData"
    })
  }

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setWasSubmited(true)

    const formData = new FormData(e.currentTarget)
    const formValues = Object.fromEntries(formData.entries())

    const formIsValid = Object.entries(formValues).filter(([type, value]) => {
      if (type === "rePassword") {
        return checkFormat(
          type as userInfoTypes,
          formValues["password"] as string,
          value as string,
        )
      }

      return checkFormat(type as userInfoTypes, value as string)
    })

    if (formIsValid.length) return

    const conditionValid = Object.values(submitConditon).filter(
      (value) => value,
    )

    if (conditionValid.length) return

    e.currentTarget.submit()
  }

  return {
    wasSubmited,
    submitConditon,
    sendCheckDuplicate,
    getCertificationNum,
    checkCertificationNum,
    submitHandler,
  }
}

export default useForm
