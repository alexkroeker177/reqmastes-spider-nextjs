'use client'

import { z } from "zod"
import { useAuth } from "@/app/context/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"

const formSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
})

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const values = { username, password }
      formSchema.parse(values)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      login(data.token, data.user)
      toast.success('Logged in successfully')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please check your credentials'
      })
    }
  }

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">Login</h2>
        <p className="text-sm text-muted-foreground">
          Please enter your credentials
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  )
} 