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
      throw new Error(error.error || error.details || `HTTP ${response.status}`)
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

  // Upload — base64 JSON (most reliable on Vercel)
  async uploadImage(file: File, filename?: string): Promise<{ url: string }> {
    const fname = filename || file.name
    const data = await compressAndEncode(file)

    return this.request<{ url: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: fname,
        data,
        contentType: 'image/jpeg',
      }),
    })
  }
}

/**
 * Compress image via canvas: resize to max 1200px, JPEG 80% quality.
 * A 12MB phone photo becomes ~200-400KB.
 */
function compressAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1200
      let w = img.width
      let h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
        else { w = Math.round((w * MAX) / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64 = dataUrl.split(',')[1] || dataUrl
      resolve(base64)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export const api = new ApiClient()

// Types
export interface User {
  id: number
  email: string
  name: string
  profile_photo: string | null
  profile_photos?: string[]
  institution: string | null
  matric_number: string | null
  verified: boolean
  mode: 'have' | 'need' | 'together' | null
  onboarding_complete: boolean
  bio: string | null
  socials: Record<string, string>
  distance_to_campus: number
  budget: string | null
  preferred_location: string | null
  preferred_area?: string | null
  subscription_status: 'active' | 'inactive' | 'cancelled'
  subscription_expires_at: string | null
}

export interface Listing {
  id: number
  user_id: number
  mode: 'have' | 'need' | 'together'
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
  u_name?: string
  u_photo?: string | null
  institution?: string
  verified?: boolean
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
