/**
 * Settings Types
 */

export interface OperatingHour {
  open: string
  close: string
  isOpen: boolean
}

export interface OperatingHours {
  monday: OperatingHour
  tuesday: OperatingHour
  wednesday: OperatingHour
  thursday: OperatingHour
  friday: OperatingHour
  saturday: OperatingHour
  sunday: OperatingHour
}

export interface RestaurantInfo {
  name: string
  address: string
  phone: string
  email: string
  logo: string
  operatingHours: OperatingHours
}

export interface TaxSettings {
  vatPercent: number
  serviceChargePercent: number
}

export interface NotificationSettings {
  newOrder: boolean
  lowStock: boolean
  newReview: boolean
  payment: boolean
}

export interface AllSettings {
  RESTAURANT_NAME: string
  RESTAURANT_ADDRESS: string
  RESTAURANT_PHONE: string
  RESTAURANT_EMAIL: string
  RESTAURANT_LOGO: string
  OPERATING_HOURS: string
  VAT_PERCENT: number
  SERVICE_CHARGE_PERCENT: number
  NOTIFICATION_NEW_ORDER: boolean
  NOTIFICATION_LOW_STOCK: boolean
  NOTIFICATION_NEW_REVIEW: boolean
  NOTIFICATION_PAYMENT: boolean
  CURRENCY: string
}
