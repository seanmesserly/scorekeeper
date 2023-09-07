import { registerUser, registerSchema } from "@lib/auth";
import { redirect } from "next/navigation";

const Register = () => {
  const submitForm = async (formData: FormData) => {
    "use server"
    const parsed = registerSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      username: formData.get("email"),
      email: formData.get("email"),
      password: formData.get("password")
    })
    if (!parsed.success) {
      //TODO: error here
      throw new Error("Failed validations")
    }
    const error = await registerUser(parsed.data)
    if (error) {
      //TODO: error here
      throw new Error("Failed to register user")
    }

    // TODO: success toast message or something
    redirect("/")
  }

  type Input = {
    name: string,
    label: string,
    type: "password" | "email" | "text"
  }

  const inputs: Array<Input> = [
    {
      name: "firstName",
      label: "First name",
      type: "text"
    },
    {
      name: "lastName",
      label: "Last name",
      type: "text"
    },
    {
      name: "username",
      label: "Username",
      type: "text"
    },
    {
      name: "email",
      label: "Email",
      type: "email"
    },
    {
      name: "password",
      label: "Password",
      type: "password"
    }
  ]

  //TODO: Create register form, validate input, submit data, show error or redirect to /
  return <main className="border-2 border-black-200 border-5 px-5 py-6 rounded">
    <form action={submitForm} className=" flex flex-col gap-5">
      {inputs.map(input => (
        <div className="flex flex-col">
          <label htmlFor={input.name}>{input.label}</label>
          <input type={input.type} name={input.name} id={input.name} className="border-2 border-black-200 rounded" />
        </div>
      ))}
      <button type="submit" className="bg-purple-500 text-white font-semibold tracking-widest px-4 py-2 rounded">Register</button>
    </form>
  </main>;
};

export default Register;