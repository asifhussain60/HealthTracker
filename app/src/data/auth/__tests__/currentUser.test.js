import { describe, it, expect } from 'vitest';
import * as currentUserModule from '../currentUser';
import { CURRENT_USER_ID } from '../currentUser';

describe('currentUser module', () => {
  it("CURRENT_USER_ID is the string 'me'", () => {
    expect(CURRENT_USER_ID).toBe('me');
    expect(typeof CURRENT_USER_ID).toBe('string');
  });

  it('exports exactly one symbol (sole-export check)', () => {
    const keys = Object.keys(currentUserModule).filter((k) => k !== 'default');
    expect(keys).toEqual(['CURRENT_USER_ID']);
  });
});
