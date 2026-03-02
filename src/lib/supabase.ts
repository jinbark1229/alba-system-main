// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uyelgootovtuxsdimlpn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZWxnb290b3Z0dXhzZGltbHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDgwNjMsImV4cCI6MjA4ODAyNDA2M30.bp2bk1wsjC6uEM1vuanVT0_dj5tXUtgdSZpyeygA8E8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database tables
export interface DbUser {
    id: string
    name: string
    password: string
    role: 'worker' | 'manager' | 'boss' | 'admin'
    store_id: 'store1' | 'store2' | 'both' | null
    created_at: string
}

export interface DbAllowedName {
    id: string
    name: string
    role: 'worker' | 'manager' | 'boss'
    store_id: 'store1' | 'store2' | 'both'
    registration_code: string
    added_at: string
}

export interface DbWorkLog {
    id: string
    user_name: string
    date: string
    start_time: string
    end_time: string
    break_duration: number
    note: string | null
    created_at: string
}

export interface DbSchedule {
    id: string
    name: string
    date: string
    start_time: string
    end_time: string
    store_id: 'store1' | 'store2'
}

export interface DbNotice {
    id: string
    title: string
    content: string
    author: string
    store_id: 'store1' | 'store2' | 'all'
    priority: 'normal' | 'important' | 'urgent'
    image_urls: string[] | null
    created_at: string
}
