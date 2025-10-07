import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}))

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})