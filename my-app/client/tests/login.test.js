import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('Login Component Input Handling', () => {
    test('updates ID and Password fields on user input', () => {
        render(<Login />);
        
        // Find the ID and Password input fields
        const idInput = screen.getByLabelText(/ID/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        // Simulate typing into the ID input field
        fireEvent.change(idInput, { target: { value: 'testID' } });
        expect(idInput.value).toBe('testID');  // Assert ID input value

        // Simulate typing into the Password input field
        fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
        expect(passwordInput.value).toBe('testPassword');  // Assert Password input value
    });
});