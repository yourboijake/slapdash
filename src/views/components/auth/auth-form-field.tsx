import type { FC } from "hono/jsx";

export type AuthFormFieldProps = {
  fieldName: string;
  fieldTitle: string;
  type: string;
  placeholder?: string;
};

export const AuthFormField: FC<AuthFormFieldProps> = ({
  fieldName,
  fieldTitle,
  type,
  placeholder,
}) => {
  return (
    <div class="form-control">
      <label class="label mb-1 mt-3 text-base" for={fieldName}>
        <span class="label-text">{fieldTitle}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder || ""}
        name={fieldName}
        class="input input-bordered focus:outline-none focus:ring-0 text-base"
      />
    </div>
  );
};
