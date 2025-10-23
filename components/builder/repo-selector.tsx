'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { RefreshCw, Building, User } from 'lucide-react'
import { toast } from 'sonner'

interface Owner {
  login: string
  avatarUrl?: string | null
  type: 'User' | 'Organization'
}

interface Repo {
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  updated_at: string
}

interface RepoSelectorProps {
  connected: boolean
  selectedOwner: string
  selectedRepo: string
  onOwnerChange: (owner: string) => void
  onRepoChange: (repo: string) => void
}

export function RepoSelector({ connected, selectedOwner, selectedRepo, onOwnerChange, onRepoChange }: RepoSelectorProps) {
  const [owners, setOwners] = useState<Owner[]>([])
  const [repos, setRepos] = useState<Repo[]>([])
  const [ownersOpen, setOwnersOpen] = useState(false)
  const [reposOpen, setReposOpen] = useState(false)
  const [loadingOwners, setLoadingOwners] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [search, setSearch] = useState('')

  const fetchOwners = useCallback(async () => {
    try {
      setLoadingOwners(true)
      const response = await fetch('/api/github/orgs', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Unable to load GitHub owners')
      }
      const data = await response.json()
      setOwners(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load GitHub owners')
      setOwners([])
    } finally {
      setLoadingOwners(false)
    }
  }, [])

  const fetchRepos = useCallback(async (owner: string) => {
    try {
      setLoadingRepos(true)
      const response = await fetch(`/api/github/repos?owner=${encodeURIComponent(owner)}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Unable to load repositories')
      }
      const data: { repos: Repo[] } = await response.json()
      setRepos(data.repos)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load repositories')
      setRepos([])
    } finally {
      setLoadingRepos(false)
    }
  }, [])

  useEffect(() => {
    if (!connected) {
      setOwners([])
      setRepos([])
      return
    }
    fetchOwners()
  }, [connected, fetchOwners])

  useEffect(() => {
    if (!connected || !selectedOwner) {
      setRepos([])
      return
    }
    fetchRepos(selectedOwner)
  }, [connected, selectedOwner, fetchRepos])

  const filteredRepos = useMemo(() => {
    if (!repos || !Array.isArray(repos)) return []
    if (!search) return repos
    const value = search.toLowerCase()
    return repos.filter((repo) => repo.name.toLowerCase().includes(value) || repo.full_name.toLowerCase().includes(value))
  }, [repos, search])

  if (!connected) {
    return null
  }

  const selectedOwnerLabel = selectedOwner || 'Select owner'
  const selectedRepoLabel = selectedRepo || 'Select repository'

  return (
    <div className="flex items-center gap-2">
      <Popover open={ownersOpen} onOpenChange={setOwnersOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 min-w-[150px] justify-between">
            <span className="truncate">{loadingOwners ? 'Loading owners…' : selectedOwnerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Filter owners" />
            <CommandList>
              <CommandEmpty>No owners found.</CommandEmpty>
              <CommandGroup heading="Owners">
                <ScrollArea className="max-h-60">
                  {Array.isArray(owners) ? owners.map((owner) => (
                    <CommandItem
                      key={owner.login}
                      onSelect={() => {
                        onOwnerChange(owner.login)
                        setOwnersOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {owner.avatarUrl ? (
                            <AvatarImage src={owner.avatarUrl} alt={owner.login} />
                          ) : (
                            <AvatarFallback>
                              {owner.login
                                .split('')
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex items-center gap-1">
                          {owner.type === 'Organization' ? <Building className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          <span>{owner.login}</span>
                        </div>
                      </div>
                    </CommandItem>
                  )) : null}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={reposOpen} onOpenChange={setReposOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 min-w-[200px] justify-between" disabled={!selectedOwner || loadingRepos}>
            <span className="truncate">
              {loadingRepos ? 'Loading repositories…' : selectedRepoLabel}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search repositories" value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No repositories found.</CommandEmpty>
              <CommandGroup heading={selectedOwner || 'Repositories'}>
                <ScrollArea className="max-h-72">
                  {filteredRepos.map((repo) => (
                    <CommandItem
                      key={repo.full_name}
                      onSelect={() => {
                        onRepoChange(repo.name)
                        setReposOpen(false)
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{repo.name}</span>
                        {repo.description ? (
                          <span className="text-xs text-muted-foreground truncate">{repo.description}</span>
                        ) : null}
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          onOwnerChange('')
          onRepoChange('')
          setSearch('')
          fetchOwners()
        }}
        aria-label="Refresh GitHub data"
      >
        <RefreshCw className={cn('h-4 w-4', (loadingOwners || loadingRepos) && 'animate-spin')} />
      </Button>
    </div>
  )
}
