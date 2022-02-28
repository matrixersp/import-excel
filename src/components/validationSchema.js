/* eslint-disable no-template-curly-in-string */
import * as yup from "yup";

export const validationSchema = yup.object().shape({
  id: yup.number().min(1),
  name: yup
    .string()
    .trim()
    .matches(
      /(^[A-Za-z]{3,16})([ ]{0,1})([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})?([ ]{0,1})?([A-Za-z]{3,16})/,
      "${path} is not valid"
    )
    .required()
    .label("Full Name"),
  email: yup.string().trim().email().required().label("Email"),
});
