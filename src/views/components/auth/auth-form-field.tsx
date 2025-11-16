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
    <div className="form-control">
      <label className="label mb-1 mt-3 text-base" for={fieldName}>
        <span className="label-text">{fieldTitle}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder || ""}
        name={fieldName}
        className="input input-bordered focus:outline-none focus:ring-0 text-base w-full"
      />
    </div>
  );
};
