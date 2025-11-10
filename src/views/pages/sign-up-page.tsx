import { Layout } from "../layout";
import type { FC } from "hono/jsx";
import { SignUpForm } from "../components/auth/sign-up-form";

export const SignUpPage: FC = (props) => {
  return (
    <Layout>
      <SignUpForm />
    </Layout>
  );
};
