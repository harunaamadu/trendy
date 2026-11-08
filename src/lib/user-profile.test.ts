import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUserProfile,
  validateAddressInput,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  INITIAL_SAVED_ADDRESSES,
  DEFAULT_USER_PROFILE,
} from './user-profile-utils';

describe('User profile validation', () => {
  it('validates default user profile correctly', () => {
    const res = validateUserProfile(DEFAULT_USER_PROFILE);
    assert.equal(res.valid, true);
  });

  it('rejects invalid email or empty name', () => {
    const res1 = validateUserProfile({ ...DEFAULT_USER_PROFILE, fullName: '' });
    assert.equal(res1.valid, false);

    const res2 = validateUserProfile({ ...DEFAULT_USER_PROFILE, email: 'not-an-email' });
    assert.equal(res2.valid, false);
  });
});

describe('Saved address operations', () => {
  it('validates required address fields', () => {
    const valid = validateAddressInput({
      fullName: 'Haruna Amadu',
      addressLine1: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    });
    assert.equal(valid.valid, true);

    const missingCity = validateAddressInput({
      fullName: 'Haruna Amadu',
      addressLine1: '123 Main St',
      state: 'WA',
      zipCode: '98101',
    });
    assert.equal(missingCity.valid, false);
  });

  it('adds address and handles default flag correctly', () => {
    const initial = [...INITIAL_SAVED_ADDRESSES];
    const updated = addSavedAddress(initial, {
      label: 'Vacation Cabin',
      fullName: 'Haruna Amadu',
      addressLine1: '100 Mountain View Rd',
      city: 'Aspen',
      state: 'CO',
      zipCode: '81611',
      country: 'United States',
      isDefault: true,
    });

    assert.equal(updated.length, initial.length + 1);
    const newAdded = updated[updated.length - 1];
    assert.equal(newAdded.isDefault, true);
    // Previous default should now be false
    const oldDefault = updated.find((a) => a.id === 'addr-1');
    assert.equal(oldDefault?.isDefault, false);
  });

  it('sets default address explicitly', () => {
    const switched = setDefaultAddress(INITIAL_SAVED_ADDRESSES, 'addr-2');
    const addr2 = switched.find((a) => a.id === 'addr-2');
    const addr1 = switched.find((a) => a.id === 'addr-1');
    assert.equal(addr2?.isDefault, true);
    assert.equal(addr1?.isDefault, false);
  });

  it('deletes address and assigns another default if the default is removed', () => {
    const deleted = deleteSavedAddress(INITIAL_SAVED_ADDRESSES, 'addr-1');
    assert.equal(deleted.length, 1);
    assert.equal(deleted[0].id, 'addr-2');
    assert.equal(deleted[0].isDefault, true);
  });
});
