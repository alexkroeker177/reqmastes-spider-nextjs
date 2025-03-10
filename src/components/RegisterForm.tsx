'use client'

import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"

const formSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

export function RegisterForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const values = { username, email, password }
      formSchema.parse(values)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful')
      router.push('/login')
    } catch (error) {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Enter details for new user
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          Create Account
        </Button>
      </form>
    </div>
  )
} 