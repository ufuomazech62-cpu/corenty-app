// API client for CoRenty
const API_BASE = '/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async getCurrentUser() {
    return this.request<User>('/auth/me')
  }

  // User Profile
  async updateUserProfile(data: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Listings
  async getListings() {
    return this.request<Listing[]>('/listings')
  }

  async getListingById(id: number) {
    return this.request<Listing>(`/listings?id=${id}`)
  }

  async createListing(data: Partial<Listing>) {
    return this.request<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateListing(id: number, data: Partial<Listing>) {
    return this.request<Listing>('/listings', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteListing(id: number) {
    return this.request<{ success: boolean }>(`/listings?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Matches
  async createMatch(listingId: number) {
    return this.request<{ matched: boolean; alreadyMatched?: boolean }>('/matches', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    })
  }

  async getMatches() {
    return this.request<Match[]>('/matches')
  }

  // Contacts (subscription-gated)
  async getUserContacts(targetUserId: number) {
    return this.request<User & { contactsLocked: boolean; message?: string }>(`/contacts?userId=${targetUserId}`)
  }

  // Payments
  async initializeSubscription() {
    return this.request<{ authorization_url: string; reference: string }>('/payments/subscribe', {
      method: 'POST',
    })
  }

  async getSubscriptionStatus() {
    return this.request<{ status: string; expires_at: string | null }>('/payments/subscribe', {
      method: 'GET',
    })
  }

  // Upload
  async uploadImage(file: File, filename?: string): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`/api/upload?filename=${filename || file.name}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }
}

export const api = new ApiClient()

// Types
export interface User {
  id: number
  email: string
  name: string
  profile_photo: string | null
  institution: string | null
  matric_number: string | null
  verified: boolean
  mode: 'have' | 'need' | null
  onboarding_complete: boolean
  bio: string | null
  socials: Record<string, string>
  distance_to_campus: number
  budget: string | null
  preferred_location: string | null
  subscription_status: 'active' | 'inactive' | 'cancelled'
  subscription_expires_at: string | null
}

export interface Listing {
  id: number
  user_id: number
  mode: 'have' | 'need'
  title: string | null
  price: string | null
  location: string | null
  description: string | null
  photos: string[]
  apartment_title: string | null
  apartment_price: string | null
  apartment_location: string | null
  apartment_description: string | null
  apartment_photos: string[]
  distance_to_campus: number | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: number
  user1_id: number
  user2_id: number
  listing_id: number
  u1_name: string
  u1_photo: string | null
  u2_name: string
  u2_photo: string | null
  created_at: string
}
