import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('deve exibir o título Sistema', () => {
    render(<AdminDashboard onNavigate={() => {}} currentPage="dashboard" />);
    expect(screen.getByText(/Sistema/i)).toBeInTheDocument();
  });
});
