import { RegisterForm } from "@/components/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
} 