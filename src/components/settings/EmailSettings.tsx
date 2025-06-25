import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Mail, Check, X, Star } from 'lucide-react'

export function EmailSettings() {
  const { user } = useAuth()
  const [emails, setEmails] = useState<Array<{
    id: string
    email: string
    is_primary: boolean
    verified_at: string | null
  }>>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmails()
  }, [user])

  const fetchEmails = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })

    if (error) {
      toast.error('Failed to fetch email addresses')
      return
    }

    setEmails(data || [])
  }

  const addEmail = async () => {
    if (!user || !newEmail) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_emails')
        .insert([{
          user_id: user.id,
          email: newEmail,
          is_primary: emails.length === 0 // Set as primary if it's the first email
        }])

      if (error) throw error

      toast.success('Email added successfully')
      setNewEmail('')
      fetchEmails()
    } catch (error) {
      toast.error('Failed to add email address')
    } finally {
      setLoading(false)
    }
  }

  const setPrimary = async (emailId: string) => {
    if (!user) return

    setLoading(true)
    try {
      // First, unset all primary emails
      await supabase
        .from('user_emails')
        .update({ is_primary: false })
        .eq('user_id', user.id)

      // Then set the new primary email
      const { error } = await supabase
        .from('user_emails')
        .update({ is_primary: true })
        .eq('id', emailId)

      if (error) throw error

      toast.success('Primary email updated')
      fetchEmails()
    } catch (error) {
      toast.error('Failed to update primary email')
    } finally {
      setLoading(false)
    }
  }

  const removeEmail = async (emailId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_emails')
        .delete()
        .eq('id', emailId)

      if (error) throw error

      toast.success('Email removed successfully')
      fetchEmails()
    } catch (error) {
      toast.error('Failed to remove email address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Addresses
        </CardTitle>
        <CardDescription>
          Add email addresses to import travel documents. Forward booking confirmations to the appropriate email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Add new email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
            />
            <Button onClick={addEmail} disabled={loading || !newEmail}>
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {email.is_primary && (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>{email.email}</span>
                  {email.verified_at ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      (Unverified)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!email.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimary(email.id)}
                      disabled={loading}
                    >
                      Set Primary
                    </Button>
                  )}
                  {!email.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmail(email.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 