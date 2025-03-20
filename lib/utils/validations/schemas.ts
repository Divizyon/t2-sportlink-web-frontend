import * as yup from 'yup';

// Ortak validasyon mesajları
export const validationMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir e-posta adresi giriniz',
  min: (field: string, length: number) => `${field} en az ${length} karakter olmalıdır`,
  max: (field: string, length: number) => `${field} en fazla ${length} karakter olmalıdır`,
  matches: (field: string) => `${field} geçerli değil`,
  passwordMatch: 'Şifreler eşleşmiyor',
};

// Login form şeması
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required(validationMessages.required)
    .email(validationMessages.email),
  password: yup
    .string()
    .required(validationMessages.required)
    .min(8, validationMessages.min('Şifre', 8)),
});

// Register form şeması
export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required(validationMessages.required)
    .min(2, validationMessages.min('Ad', 2))
    .max(50, validationMessages.max('Ad', 50)),
  lastName: yup
    .string()
    .required(validationMessages.required)
    .min(2, validationMessages.min('Soyad', 2))
    .max(50, validationMessages.max('Soyad', 50)),
  email: yup
    .string()
    .required(validationMessages.required)
    .email(validationMessages.email),
  password: yup
    .string()
    .required(validationMessages.required)
    .min(8, validationMessages.min('Şifre', 8))
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      validationMessages.matches('Şifre')
    ),
  confirmPassword: yup
    .string()
    .required(validationMessages.required)
    .oneOf([yup.ref('password')], validationMessages.passwordMatch),
});

// Form tiplemeleri
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>; 