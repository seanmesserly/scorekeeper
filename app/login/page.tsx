import { login, loginSchema } from "@lib/auth";
import { redirect } from "next/navigation";

const Login = () => {
  const submitForm = async (formData: FormData) => {
    "use server"
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    })
    if (!parsed.success) {
      //TODO: error here
      throw new Error("Failed validations")
    }
    const error = await login(parsed.data)
    if (error) {
      //TODO: error here
      throw new Error("Failed to login")
    }

    // TODO: success toast message or something
    redirect("/")
  }

  //TODO: Create login form, validate input, submit data, show error or redirect to /login
  return <main className="border-2 border-black-200 border-5 px-5 py-6 rounded">
    <form action={submitForm} className=" flex flex-col gap-5">
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input type="text" name="email" id="email" className="border-2 border-black-200 rounded" />
      </div>
      <div className="flex flex-col">
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" className="border-2 border-black-200 rounded" />
      </div>
      <button type="submit" className="bg-purple-500 text-white font-semibold tracking-widest px-4 py-2 rounded">Login</button>
    </form>
  </main>;
};

export default Login;
