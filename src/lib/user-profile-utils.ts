import { UserProfile, SavedAddress } from '../types/ecommerce';

export const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Haruna Amadu',
  email: 'harunaamadu@gmail.com',
  phone: '+1 (555) 382-9014',
  preferredSize: 'M',
  stylePreference: 'Modern Minimalist & Tailored Knitwear',
  marketingEmails: true,
  smsUpdates: false,
};

export const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Home (Default)',
    fullName: 'Haruna Amadu',
    addressLine1: '742 Evergreen Terrace',
    addressLine2: 'Apt 4B',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'United States',
    phone: '+1 (555) 382-9014',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Design Studio / Office',
    fullName: 'Haruna Amadu',
    addressLine1: '1200 Westlake Ave N',
    addressLine2: 'Suite 600',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
    country: 'United States',
    phone: '+1 (555) 382-9014',
    isDefault: false,
  },
];

export function validateUserProfile(profile: UserProfile): { valid: boolean; error?: string } {
  if (!profile.fullName || profile.fullName.trim().length < 2) {
    return { valid: false, error: 'Please enter a valid full name.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!profile.email || !emailRegex.test(profile.email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function validateAddressInput(address: Partial<SavedAddress>): { valid: boolean; error?: string } {
  if (!address.fullName || address.fullName.trim().length < 2) {
    return { valid: false, error: 'Recipient full name is required.' };
  }
  if (!address.addressLine1 || address.addressLine1.trim().length < 4) {
    return { valid: false, error: 'Street address is required.' };
  }
  if (!address.city || address.city.trim().length < 2) {
    return { valid: false, error: 'City is required.' };
  }
  if (!address.state || address.state.trim().length < 2) {
    return { valid: false, error: 'State/Region is required.' };
  }
  if (!address.zipCode || address.zipCode.trim().length < 3) {
    return { valid: false, error: 'Zip / Postal code is required.' };
  }
  return { valid: true };
}

export function addSavedAddress(
  addresses: SavedAddress[],
  newAddr: Omit<SavedAddress, 'id'>
): SavedAddress[] {
  const id = `addr-${Date.now()}`;
  const shouldBeDefault = newAddr.isDefault || addresses.length === 0;

  const sanitizedList = addresses.map((a) =>
    shouldBeDefault ? { ...a, isDefault: false } : a
  );

  return [...sanitizedList, { ...newAddr, id, isDefault: shouldBeDefault }];
}

export function updateSavedAddress(
  addresses: SavedAddress[],
  id: string,
  patch: Partial<SavedAddress>
): SavedAddress[] {
  const shouldBeDefault = patch.isDefault === true;

  return addresses.map((a) => {
    if (a.id === id) {
      return { ...a, ...patch };
    }
    if (shouldBeDefault) {
      return { ...a, isDefault: false };
    }
    return a;
  });
}

export function deleteSavedAddress(addresses: SavedAddress[], id: string): SavedAddress[] {
  const filtered = addresses.filter((a) => a.id !== id);
  if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
    filtered[0].isDefault = true;
  }
  return filtered;
}

export function setDefaultAddress(addresses: SavedAddress[], id: string): SavedAddress[] {
  return addresses.map((a) => ({
    ...a,
    isDefault: a.id === id,
  }));
}
