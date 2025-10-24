'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Key, Server } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { useState } from 'react'
import { ApiKeysDialog } from '@/components/builder/api-keys-dialog'
import { SandboxesDialog } from '@/components/builder/sandboxes-dialog'

interface UserProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  authProvider?: string | null
}

export function User({ user, authProvider }: UserProps) {
  const [showApiKeysDialog, setShowApiKeysDialog] = useState(false)
  const [showSandboxesDialog, setShowSandboxesDialog] = useState(false)

  if (!user) {
    return (
      <Button asChild size="sm" className="h-8">
        <Link href="/api/auth/signin">Sign In</Link>
      </Button>
    )
  }

    const handleSignOut = async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
          window.location.href = '/'
          },
        },
    })
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
    </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {authProvider && (
            <p className="text-xs text-muted-foreground">via {authProvider}</p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => setShowApiKeysDialog(true)} className="cursor-pointer">
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setShowSandboxesDialog(true)} className="cursor-pointer">
          <Server className="h-4 w-4 mr-2" />
          Sandboxes
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <ApiKeysDialog open={showApiKeysDialog} onOpenChange={setShowApiKeysDialog} />
      <SandboxesDialog open={showSandboxesDialog} onOpenChange={setShowSandboxesDialog} />
    </DropdownMenu>
  )
}