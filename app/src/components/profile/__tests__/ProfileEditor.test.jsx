/**
 * ProfileEditor.test.jsx — AC-P1D-D2 RED
 *
 * Tests for <ProfileEditor> — the full profile editor component.
 * Uses mocked useProfileRepo and mocked useNavigate.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileEditor } from '../ProfileEditor.jsx';

// Mock useProfileRepo
vi.mock('../../../data/repositories/useProfileRepo.js', () => ({
  useProfileRepo: vi.fn(),
}));

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();

import { useProfileRepo } from '../../../data/repositories/useProfileRepo.js';

const SEED = {
  name: 'Asif',
  heightCm: 177,
  ageYears: 45,
  dailyCalorieTarget: 1900,
  intermittentFasting: { windowStart: '12:00', windowEnd: '20:00' },
  sleepSchedule: { bedtime: '23:00', wakeTime: '06:00' },
  prayerSettings: {
    lat: 40.7128,
    lng: -74.006,
    calculationMethod: 'ISNA',
    asrSchool: 'Standard',
    remindersEnabled: true,
  },
  fitnessLevel: 'beginner',
  workoutPlan: {
    walkDailyMinutes: 30,
    kickboxingPerWeek: 3,
    weightsPerWeek: 2,
    dailyWeightSessionCap: 1,
  },
  sweetToothPlan: {
    weeklyCap: 2,
    confirmEachLog: true,
    deletable: false,
  },
};

function makeRepo(profile = SEED) {
  const updateProfile = vi.fn((patch) => ({ ...profile, ...patch }));
  return { getProfile: () => ({ ...profile }), updateProfile };
}

function renderEditor(profile = SEED) {
  useProfileRepo.mockReturnValue(makeRepo(profile));
  return render(
    <MemoryRouter>
      <ProfileEditor />
    </MemoryRouter>
  );
}

describe('ProfileEditor — identity section', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders displayName field pre-filled', () => {
    renderEditor();
    expect(screen.getByDisplayValue('Asif')).toBeTruthy();
  });

  it('renders heightCm field', () => {
    renderEditor();
    expect(screen.getByLabelText(/height/i)).toBeTruthy();
  });

  it('renders ageYears field', () => {
    renderEditor();
    expect(screen.getByLabelText(/age \(years\)/i)).toBeTruthy();
  });
});

describe('ProfileEditor — calorie target section', () => {
  it('renders dailyCalorieTarget field', () => {
    renderEditor();
    expect(screen.getByLabelText(/calorie target/i)).toBeTruthy();
  });
});

describe('ProfileEditor — intermittent fasting section', () => {
  it('renders windowStart field', () => {
    renderEditor();
    expect(screen.getByLabelText(/window start/i)).toBeTruthy();
  });

  it('renders windowEnd field', () => {
    renderEditor();
    expect(screen.getByLabelText(/window end/i)).toBeTruthy();
  });
});

describe('ProfileEditor — sleep section', () => {
  it('renders bedtime field', () => {
    renderEditor();
    expect(screen.getByLabelText(/bedtime/i)).toBeTruthy();
  });

  it('renders wakeTime field', () => {
    renderEditor();
    expect(screen.getByLabelText(/wake time/i)).toBeTruthy();
  });
});

describe('ProfileEditor — save', () => {
  it('calls updateProfile with changed displayName', () => {
    const repo = makeRepo();
    useProfileRepo.mockReturnValue(repo);
    render(<MemoryRouter><ProfileEditor /></MemoryRouter>);
    const nameInput = screen.getByDisplayValue('Asif');
    fireEvent.change(nameInput, { target: { value: 'Bob' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(repo.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bob' })
    );
  });
});

describe('ProfileEditor — deep-link buttons', () => {
  it('renders Manage Fasting-Safe Items button', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /fasting.safe/i })).toBeTruthy();
  });

  it('renders Manage Work Locations button', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /work location/i })).toBeTruthy();
  });

  it('renders Manage Sweet Tooth button', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /sweet tooth/i })).toBeTruthy();
  });

  it('navigates to /profile/fasting-safe when button clicked', () => {
    renderEditor();
    fireEvent.click(screen.getByRole('button', { name: /fasting.safe/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/profile/fasting-safe');
  });
});

describe('ProfileEditor — full round-trip', () => {
  it('renders all expected sections without crashing', () => {
    renderEditor();
    // All major sections present
    expect(screen.getByText(/identity/i)).toBeTruthy();
    expect(screen.getAllByText(/calorie target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fasting/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sleep/i)).toBeTruthy();
  });
});
