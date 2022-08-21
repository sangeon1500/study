import { ChangeEvent, useEffect, useState } from "react"
import styles from "../styles/components/CheckData.module.scss"
import { CheckCommonProps } from "../types/types"
import { checkFormat } from "../utils/utils"

const CheckCommon = ({ type, wasSubmited }: CheckCommonProps) => {
  const [value, setValue] = useState("")
  const [wasChanged, setWasChanged] = useState(false)
  const [messageType, setMessageType] = useState<string>("")
  const displayMessage = wasChanged || wasSubmited
  const labelText = type === "name" ? "이름" : "생년월일"

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    setValue(value)
    setWasChanged(true)

    const nextMessageType = checkFormat(type, value)
      ? "validFormat"
      : "inValidFormat"
    setMessageType(nextMessageType)
  }

  const getInformText = (text: string) => {
    if (value.length === 0) return "필수 정보입니다."
    switch (text) {
      case "blankData":
        return "필수 정보입니다."
      case "inValidFormat":
        return type === "name"
          ? "이름은 2글자 이상 50글자 이하만 가능합니다."
          : ""
      default:
        return ""
    }
  }

  const getClassNameType = (text: string) => {
    return ["blankData", "inValidFormat"].includes(text)
  }

  useEffect(() => {
    if (value.length === 0) {
      setMessageType("blankData")
    }
  }, [wasSubmited])

  return (
    <section className={styles.section}>
      <label htmlFor={type}>
        <span>{labelText}</span>
        <div className={styles.labelInputContainer}>
          <input
            className={type === "birth" ? styles.inputDate : styles.input}
            type={type === "birth" ? "date" : "text"}
            min={type === "birth" ? "1900-01-01" : ""}
            max={type === "birth" ? new Date().toISOString().split("T")[0] : ""}
            name={type}
            id={type}
            onChange={handleChange}
          />
        </div>
      </label>
      {displayMessage && (
        <p
          className={
            getClassNameType(messageType) ? styles.notice : styles.noticeGreen
          }
        >
          {getInformText(messageType)}
        </p>
      )}
    </section>
  )
}

export default CheckCommon
